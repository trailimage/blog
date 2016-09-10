'use strict';

// simplified Redis interface

const is = require('./is');
const c = require('./constants');
const log = require('./logger');
const config = require('./config');
const Redis = require('redis');
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

// region Connectivity

const code = {
   BROKEN: 'CONNECTION_BROKEN',
   TIMEOUT: 'ETIMEDOUT',
   ERROR: 'ERR'
};
const event = {
   CONNECTED: 'connected',
   FATAL: 'fatal'
};
let connected = false;
let ready = true;

client.on('error', err => {
   let fatal = false;

   if (err.code == code.BROKEN) {
      // if unable to connect to Redis then use in-memory hash only
      log.error("Unable to connect to Redis at %s:%d", url.hostname, url.port);
      fatal = true;
   } else if (err.code == code.ERROR && err.command == 'AUTH') {
      log.error("Unable to authorize Redis at %s:%d (%s)", url.hostname, url.port, err.message);
      fatal = true;
   } else {
      // log error but keep trying to connect
      log.error("Error during redis call: %s", err.message);
   }

   if (fatal) { ready = false; }
});

client.on('connect', ()=> {
   log.infoIcon(c.icon.link, "Redis connected to %s:%d", url.hostname, url.port);
   connected = true;
});

// endregion

/**
 * Normalize data value for cache storage
 * @param {Object|String|Array} value
 * @returns {String}
 */
function normalize(value) {
   if (typeof value == is.type.OBJECT) {
      const cache = require('./cache');
      return cache.output.is(value) ? cache.output.serialize(value) : JSON.stringify(value);
   } else {
      return value;
   }
}

/**
 * Deserialize objects as needed
 * @param {Object|String} value
 * @returns {Object}
 */
function parseObject(value) {
   return is.empty(value) ? null : JSON.parse(value);
}

/**
 * Normalize response
 * @param {String} key Cache key
 * @param {Number} type Date type
 * @param {Function} resolve
 * @param {Function} reject
 */
function responder(key, type = dataType.NONE, resolve, reject) {
   const howMany = key => is.array(key) ? key.length : 1;
   const answer = (actual, expected) => {
      if (expected === undefined || actual === expected) {
         resolve(actual);
      } else {
         reject('Redis replied ' + (actual || 'NULL') + ' when ' + (expected || 'NOT NULL') + ' was expected');
      }
   };
   return (err, reply) => {
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
   }
}

/**
 * Whether Redis returned an error
 * @param {String|String[]} key
 * @param {Object|Number|String} err
 * @returns {Boolean}
 */
function hasError(key, err) {
   if (err !== null) {
      if (is.array(key)) { key = key.toString(); }
      log.error('Operation with key "%s" resulted in %s', key, err.toString());
      return true;
   }
   return false;
}

module.exports = {
   dataType,

   /**
    * Get all items of a hash
    * @param {String} key
    * @returns {Promise}
    */
   getAll(key) {
      return new Promise((resolve, reject) => {
         client.hgetall(key, responder(key, dataType.RAW, resolve, reject));
      });
   },

   /**
    * Whether key or hash key exists
    * @param {String} key
    * @param {String} hashKey
    */
   exists(key, hashKey) {
      return new Promise((resolve, reject) => {
         const reply = responder(key, dataType.BIT, resolve, reject);
         if (hashKey === undefined) {
            client.exists(key, reply);
         } else {
            client.hexists(key, hashKey, reply);
         }
      });
   },

   /**
    * All hash keys
    * @param {String} key
    * @see http://redis.io/commands/keys
    * @returns {Promise}
    */
   keys(key) {
      return new Promise((resolve, reject) => {
         const reply = responder(key, dataType.RAW, resolve, reject);
         if (/[\?\*\[\]]/.test(key)) {
            // pattern match against root keys
            client.keys(key, reply);
         } else {
            // all fields of a hash key
            client.hkeys(key, reply);
         }
      });
   },

   /**
    * Return raw value
    * @param {String} key
    * @param {String} [hashKey]
    * @returns {Promise}
    */
   get(key, hashKey) { return this.getValue(dataType.RAW, key, hashKey); },

   /**
    * Get key or hash field value as an object
    * @param {String} key
    * @param {String} [hashKey]
    * @returns {Promise}
    */
   getObject(key, hashKey) { return this.getValue(dataType.JSON, key, hashKey); },

   /**
    * Get key or hash field value as given type
    * @param {Number} type Reply type
    * @param {String} key
    * @param {String} [hashKey]
    * @returns {Promise}
    * @see http://redis.io/commands/get
    */
   getValue(type, key, hashKey) {
      return new Promise((resolve, reject) => {
         const reply = responder(key, type, resolve, reject);
         if (hashKey === undefined) {
            client.get(key, reply);
         } else {
            client.hget(key, hashKey, reply);
         }
      });
   },

   /**
    * Add value to key or hash key
    * @param {String} key
    * @param {String|Object} hashKeyOrValue Key value or member key
    * @param {String|Object} [value] Member value
    * @returns {Promise}
    */
   add(key, hashKeyOrValue, value) {
      let hashKey;
      if (value === undefined) {
         value = hashKeyOrValue;
      } else {
         hashKey = hashKeyOrValue;
      }
      return new Promise((resolve, reject) => {
         if (hashKey !== undefined) {
            client.hset(key, hashKey, normalize(value), responder(key, dataType.NONE, resolve, reject));
         } else {
            client.set(key, normalize(value), responder(key, dataType.OKAY, resolve, reject));
         }
      });
   },

   /**
    * Add all hash items
    * @param {String} key
    * @param {Object} hash Name-value pairs
    * @returns {Promise}
    */
   addAll(key, hash) {
      return new Promise((resolve, reject) => {
         client.hmset(key, hash, responder(key, dataType.OKAY, resolve, reject));
      });
   },

   /**
    * Remove key or key field (hash) from storage
    * @param {String|String[]} key
    * @param {String|String[]} [hashKey]
    * @returns {Promise}
    */
   remove(key, hashKey) {
      return new Promise((resolve, reject) => {
         if (is.empty(key)) {
            reject('Attempt to delete hash item with empty key');
         } else if (!connected) {
            reject('Attempt to delete "' + key + '" field from disconnected cache');
         } else if (hashKey !== undefined) {
            // implies that hash field is the second argument
            if ((is.array(hashKey) && hashKey.length === 0) || is.empty(hashKey)) {
               reject('Attempt to delete "' + key + '" field with empty field name');
            } else {
               // success cannot be measured by number of deleted records (dataType.COUNT)
               // because post refresh blindly sends all keys for deletion without
               // knowing if they're actually cached
               this.removeMember(key, hashKey, responder(key, dataType.NONE, resolve, reject));
            }
         } else {
            const reply = responder(key, dataType.COUNT, resolve, reject);

            if (is.array(key)) {
               client.hdel(key, reply);
            } else {
               client.del(key, reply);
            }
         }
      });
   },

   /**
    * Node redis is a little dumb here and merely toString()'s the field
    * array if passed as a second argument so instead combine the key
    * and fields which get converted into a list of arguments which is
    * what redis server hdel actuall expects
    * @param {String} key
    * @param {String} memberKey
    * @param {Function} callback
    */
   removeMember(key, memberKey, callback) { client.hdel([key].concat(memberKey), callback); },

   /**
    * Delete one key and add another
    * @param {String} key Hash key or old string key
    * @param {String} p2 Old hash field or new string key
    * @param {String|Object} p3 New hash field or value
    * @param {String|Object|function(boolean)} p4 Hash value or callback
    * @param {function(boolean)} [p5] Callback if replacing hash field
    */
   replace(key, p2, p3, p4, p5) {
      if (p5 === undefined) {
         client.multi()
            .del(key)
            .set(p2, normalize(p3))
            .exec((err, replies) => {
               log.info('MULTI got %d replies', replies.length);
               replies.forEach((reply, index) => {
                  log.info("Reply %d: %s", index, reply);
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
                  log.info("Reply %d: %s", index, reply);
               });
            });
      }
   },

   disconnect() { client.quit(); }
};
