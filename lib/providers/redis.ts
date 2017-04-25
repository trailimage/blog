// simplified Redis interface
import { Cache } from '../types';
import is from '../is';
import log from '../logger';
import config from '../config';
import * as Redis from 'redis';

const URL = require('url');
const url = URL.parse(config.redis.url);
const client = Redis.createClient(url.port, url.hostname, {
   no_ready_check: true,
   password: url.auth.split(':')[1]
});
// expected hash response used for validation and parsing
const dataType = {
   NONE: 0,            // don't check the reply
   OKAY: 1,            // check for 'OK'
   COUNT: 2,           // reply should match key count
   BIT: 3,             // 1 or 0
   RAW: 4,             // return raw data without validation or parsing
   JSON: 5             // parse as JSON
};

const code = {
   BROKEN: 'CONNECTION_BROKEN',
   TIMEOUT: 'ETIMEDOUT',
   ERROR: 'ERR'
};
const event = {
   CONNECTED: 'connected',
   FATAL: 'fatal'
};
// http://redis.io/commands
const command = {
   AUTH: 'AUTH',
   DEL: 'DEL',
   EXEC: 'EXEC',
   GET: 'GET',
   HASH_GET: 'HGET',
   HASH_DEL: 'HDEL'
};
let connected = false;
// client is ready to cache commands before it's connected
let ready = true;

client.on('error', (err:any) => {
   let fatal = false;

   if (err.code == code.BROKEN) {
      // if unable to connect to Redis then use in-memory hash only
      log.error('Unable to connect to Redis at %s:%d', url.hostname, url.port);
      fatal = true;
   } else if (err.code == code.ERROR && err.command == command.AUTH) {
      log.error('Unable to authorize Redis at %s:%d (%s)', url.hostname, url.port, err.message);
      fatal = true;
   } else {
      // log error but keep trying to connect
      log.error('Error during redis call: %s', err.message);
   }

   if (fatal) { ready = false; }
});

client.on('connect', ()=> {
   log.infoIcon('settings_input_component', 'Redis connected to %s:%d', url.hostname, url.port);
   connected = true;
});

client.on('end', ()=> {
   log.warn('Redis connection has ended');
   connected = false;
});

/**
 * Normalize data value for cache storage
 */
function normalize(value:string|string[]|Cache.Item):string {
   if (typeof value == is.type.OBJECT) {
      const cache = require('../cache');
      return is.cacheItem(value) ? cache.redisView.serialize(value) : JSON.stringify(value);
   } else {
      return value as string;
   }
}

/**
 * Deserialize objects as needed
 */
function parseObject(value:string) {
   if (is.empty(value)) { return null; }

   try {
      return JSON.parse(value)
   } catch (err) {
      log.error('Unable to JSON parse "%s"', value);
      return null;
   }
}

/**
 * Normalize response
 */
function makeHandler(key:string|string[], type = dataType.NONE, resolve:Function, reject:Function) {
   // calculate expected response
   const howMany = (key:string|string[]) => is.array(key) ? key.length : 1;
   // if expectation provided then result is whether it matches actual
   // otherwise return raw response
   const answer = (actual:any, expected?:any) => {
      resolve((expected === undefined) ? actual : (actual == expected));
   };
   return (err:any, reply:any) => {
      if (hasError(key, err)) {
         reject(err);
      } else {
         switch (type) {
            case dataType.BIT: answer(reply, 1); break;
            case dataType.OKAY: answer(reply, 'OK'); break;
            case dataType.COUNT: answer(reply, howMany(key)); break;
            case dataType.RAW: answer(reply); break;
            case dataType.JSON: answer(parseObject(reply)); break;
            case dataType.NONE: resolve(); break;
            default: reject('Unknown Redis data type');
         }
      }
   };
}

/**
 * Whether Redis returned an error
  */
function hasError(key:string|string[], err:any):boolean {
   if (is.value(err)) {
      if (is.array(key)) { key = key.join(','); }
      log.error('Operation with key "%s" resulted in', key, err);
      if (is.defined(err, 'message') && err.message.indexOf(`memory > 'maxmemory'`) > 0) {
         // error indicates Redis will not respond to any queries
         log.error('Disabling all caching');
         config.cache.setAll(false);
      }
      return true;
   }
   return false;
}

export default {
   dataType,

   /**
    * Get all items of a hash
    */
   getAll: (key:string) => new Promise((resolve, reject) => {
      client.hgetall(key, makeHandler(key, dataType.RAW, resolve, reject));
   }),

   /**
    * Whether key or hash key exists
    */
   exists: (key:string, hashKey:string) => new Promise<boolean>((resolve, reject) => {
      const handler = makeHandler(key, dataType.BIT, resolve, reject);
      if (hashKey === undefined) {
         client.exists(key, handler);
      } else {
         client.hexists(key, hashKey, handler);
      } 
   }),

   /**
    * All hash keys
    *
    * See http://redis.io/commands/keys
    */
   keys: (key:string) => new Promise<string[]>((resolve, reject) => {
      const handler = makeHandler(key, dataType.RAW, resolve, reject);
      if (/[\?\*\[\]]/.test(key)) {
         // wildcard match against root keys
         client.keys(key, handler);
      } else {
         // all fields of a hash key
         client.hkeys(key, handler);
      }
   }),

   /**
    * Return raw value
    */
   get(key:string, hashKey:string) { return this.getValue(dataType.RAW, key, hashKey); },

   /**
    * Get key or hash field value as an object
    */
   getObject<T>(key:string, hashKey:string):Promise<T> {
      return this.getValue(dataType.JSON, key, hashKey);
   },

   /**
    * Get key or hash field value as given type
    *
    * See http://redis.io/commands/get
    */
   getValue: (type:number, key:string, hashKey?:string) => new Promise((resolve, reject) => {
      const handler = makeHandler(key, type, resolve, reject);
      if (hashKey === undefined) {
         client.get(key, handler);
      } else {
         client.hget(key, hashKey, handler);
      }
   }),

   /**
    * Add value to key or hash key
    */
   add(key:string, hashKeyOrValue:string|object, value?:any) {
      let hashKey:string|object;
      if (value === undefined) {
         value = hashKeyOrValue;
      } else {
         hashKey = hashKeyOrValue;
      }
      return (new Promise((resolve, reject) => {
         if (hashKey !== undefined) {
            client.hset(key, hashKey, normalize(value), makeHandler(key, dataType.NONE, resolve, reject));
         } else {
            client.set(key, normalize(value), makeHandler(key, dataType.OKAY, resolve, reject));
         }
      }))
         .then(()=> value);
   },

   /**
    * Add all hash items
    */
   addAll: (key:string, hash:{[key:string]:string}) => new Promise((resolve, reject) => {
      client.hmset(key, hash, makeHandler(key, dataType.OKAY, resolve, reject));
   }),

   /**
    * Remove key or key field (hash) from storage
    * If hashKey is provided and key is an array then the same hashKey field
    * will be removed from every key value
    */
   remove: (key:string|string[], hashKey?:string|string[]) => new Promise((resolve, reject) => {
      if (is.empty(key)) {
         reject('Attempt to delete hash item with empty key');
      } else if (is.value(hashKey)) {
         // implies that hash field is the second argument
         if ((is.array(hashKey) && hashKey.length === 0) || is.empty(hashKey)) {
            reject('Attempt to delete "' + key + '" field with empty field name');
         } else {
            // Node redis is a little dumb and merely toString()'s the hashKey
            // array if passed as a second argument so instead combine the key
            // and hashKeys as first argument which become list of arguments which
            // redis server hdel expects (http://redis.io/commands/hdel)
            if (is.array(key)) {
               resolve(Promise.all(key.map(k => new Promise((resolve, reject) => {
                  client.hdel([k].concat(hashKey), makeHandler(key, dataType.COUNT, resolve, reject));
               }))));
            } else {
               client.hdel([key].concat(hashKey), makeHandler(key, dataType.COUNT, resolve, reject));
            }
         }
      } else {
         client.del(key, makeHandler(key, dataType.COUNT, resolve, reject));
      }
   }),

   /**
    * Delete one key and add another
    * @param {string} key Hash key or old string key
    * @param {string} p2 Old hash field or new string key
    * @param {string|object} p3 New hash field or value
    * @param {String|Object|function(boolean)} p4 Hash value or callback
    * @param {function(boolean)} [p5] Callback if replacing hash field
    */
   replace(key:string, p2:string, p3:string|{[key:string]:string}, p4:string|{[key:string]:string}|Function, p5?:Function) {
      if (p5 === undefined) {
         client.multi()
            .del(key)
            .set(p2, normalize(p3))
            .exec((err, replies) => {
               log.info('MULTI got %d replies', replies.length);
               replies.forEach((reply, index) => {
                  log.info('Reply %d: %s', index, reply);
               });
            });
      } else {
         // hash
         client.multi()
            .hdel(key, p2)
            .hset(key, p3, normalize(p4))
            .exec((err, replies) => {
               log.info('MULTI got %d replies', replies.length);
               replies.forEach((reply, index) => {
                  log.info('Reply %d: %s', index, reply);
               });
            });
      }
   },

   disconnect() {
      if (connected) {
         client.quit();
         connected = false;
      }
   }
};
