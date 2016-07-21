'use strict';

// simplified Redis interface

const is = require('./is');
const log = require('./logger');
const cache = require('./cache');
const config = require('./config');
const Redis = require('redis');
const URL = require('url');
const url = URL.parse(config.redis.url);
const client = Redis.createClient(url.port, url.hostname, { max_attempts: 2 });
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

   if (fatal) {
      ready = false;
      this.emit(event.FATAL);
   }
});

client.on('connect', () => {
   log.infoIcon(icon.link, "Redis connected to %s:%d", url.hostname, url.port);
   connected = true;
   this.authorize(url.auth);
   this.emit(event.CONNECTED);
});

// current client wants password only for auth (auth <username>:<password>)
function authorize(auth) {
   let parts = auth.split(':');
   log.infoIcon(icon.login, "Authenticating Redis connection");
   client.auth(parts[1]);
}

// endregion

/**
 * Normalize data value for cache storage
 * @param {Object|String|Array} value
 * @returns {String}
 */
function normalize(value) {
   if (typeof value == is.type.OBJECT) {
      return (cache.view.is(value)) ? cache.view.serialize(value) : JSON.stringify(value);
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
 * @param {Function} callback Method that receives value
 * @param {Number} type Date type
 * @returns {Function} Method that handles the provider-specific response
 */
function responder(key, callback, type) {
   const howMany = key => is.array(key) ? key.length : 1;
   return (err, reply) => {
      let error = hasError(key, err);

      if (is.callable(callback)) {
         let response = null;
         if (type === undefined) { type = dataType.NONE; }

         if (error) {
            if (type !== dataType.RAW && type !== dataType.JSON) { response = false; }
         } else {
            switch (type) {
               case dataType.BIT: response = (reply == 1); break;
               case dataType.OKAY: response = (reply == 'OK'); break;
               case dataType.COUNT: response = (reply == howMany(key)); break;
               case dataType.RAW: response = reply; break;
               case dataType.JSON: response = parseObject(reply); break;
               case dataType.NONE: response = true; break;
            }
         }
         callback(response);
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
    * @param {function(Object|String)} callback
    */
   getAll(key, callback) { client.hgetall(key, responder(key, callback, dataType.RAW)); },

   /**
    * Whether key or hash key exists
    * @param {String} key
    * @param {String|function(Boolean)} p2 Hash key or callback
    * @param {function(Boolean)} [p3] Callback if hash key supplied
    */
   exists(key, p2, p3) {
      if (p3 === undefined) {
         // p2 is the callback
         client.exists(key, responder(key, p2, dataType.BIT));
      } else {
         // p2 is a field name, p3 is the callback
         client.hexists(key, p2, responder(key, p3, dataType.BIT));
      }
   },

   /**
    * All hash keys
    * @param {String} key
    * @param {function(String[])} callback
    * @see http://redis.io/commands/keys
    */
   keys(key, callback) {
      if (/[\?\*\[\]]/.test(key)) {
         // pattern match against root keys
         client.keys(key, responder(key, callback, dataType.RAW));
      } else {
         // all fields of a hash key
         client.hkeys(key, responder(key, callback, dataType.RAW));
      }
   },

   /**
    * Return raw value
    * @param {String} key
    * @param {String|function(Object)} p2 Hash key or callback
    * @param {function(Object)} [p3] Callback if hash key given
    */
   get(key, p2, p3) { this.getValue(dataType.RAW, key, p2, p3); },

   /**
    * Get key or hash field value as an object
    * @param {String} key
    * @param {String|function(Object)} [p2] Hash key or callback
    * @param {function(Object|Array)} [p3] Callback if hash key given
    */
   getObject(key, p2, p3) { this.getValue(dataType.JSON, key, p2, p3); },

   /**
    * Get key or hash field value as given type
    * @param {Number} type Reply type
    * @param {String} key
    * @param {String|function(Object)} [p2] Member key or callback
    * @param {function(Object)} [p3] Callback if hash key given
    * @private
    */
   getValue(type, key, p2, p3) {
      let callback = (p3 === undefined) ? p2 : p3;
      if (p3 === undefined) {
         // http://redis.io/commands/get
         client.get(key, responder(key, callback, type));
      } else {
         client.hget(key, p2, responder(key, callback, type));
      }
   },

   /**
    * Add value to key or hash key
    * @param {String} key
    * @param {String|Object} p2 Key value or member key
    * @param {String|Object|function(Boolean)} [p3] Member value or callback
    * @param {function(Boolean)} [p4] Callback
    */
   add(key, p2, p3, p4) {
      if (p4 !== undefined || (p3 !== undefined && !(p3 instanceof Function))) {
         client.hset(key, p2, normalize(p3), responder(key, p4, dataType.NONE));
      } else if (p3 !== undefined) {
         client.set(key, normalize(p2), responder(key, p3, dataType.OKAY));
      } else if (p2 !== undefined) {
         client.set(key, normalize(p2));
      }
   },

   /**
    * Add all hash items
    * @param {String} key
    * @param {Object} hash Name-value pairs
    * @param {function(Boolean)} [callback]
    */
   addAll(key, hash, callback) {
      client.hmset(key, hash, responder(key, callback, dataType.OKAY));
   },

   /**
    * Remove key or key field (hash) from storage
    * @param {String|String[]} key
    * @param {String|String[]|function(Boolean)} [p2] Hash key or callback
    * @param {function(Boolean)} [p3] Callback if hash key given
    */
   remove(key, p2, p3) {
      let callback = (p3 === undefined)
         ? is.callable(p2) ? p2 : null
         : p3;

      if (is.empty(key)) {
         log.error('Attempt to delete hash item with empty key');
         callback(false);
      } else if (!p.connected) {
         log.warn('Attempt to delete "%s" field from disconnected cache', key);
         callback(false);
      } else if (is.value(p3) || !(is.callable(p2))) {
         // implies that hash field is the second argument
         if ((is.array(p2) && p2.length === 0) || is.empty(p2)) {
            log.error('Attempt to delete "%s" field with empty field name', key);
            callback(false);
         } else {
            // success cannot be measured by number of deleted records (dataType.COUNT)
            // because post refresh blindly sends all keys for deletion without
            // knowing if they're actually cached
            this.removeMember(key, p2, responder(p2, callback, dataType.NONE));
         }
      } else {
         this.remove(key, responder(key, callback, dataType.COUNT));
      }
   },

   // remove(key, callback) {
   //    if (is.array(key)) {
   //       client.hdel(key, callback);
   //    } else {
   //       client.del(key, callback);
   //    }
   // },

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

   disconnect() { client.end(); }
};
