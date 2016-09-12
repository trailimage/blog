'use strict';

const is = require('./is');
const config = require('./config');
const redis = require('./redis');
// Redis uses colon prefix as a kind of namespace
const prefix = 'api:';
const viewKey = 'view';
const mapKey = 'map';
/**
 * Whether key with prefix exists
 * @param {String} key
 * @param {String} hashKey
 * @param {Boolean} enabled Whether caching is enabled
 * @returns {Promise.<Boolean>}
 */
const exists = (key, hashKey, enabled) => enabled
   ? redis.exists(key, hashKey)
   : Promise.resolve(false);

/**
 * Manage cache interaction
 */
module.exports = {
   prefix,
   /**
    * Retrieve cached value
    * @param {String} key
    * @param {String} [hashKey]
    * @returns {Promise}
    */
   item: (key, hashKey) => redis.getObject(prefix + key, hashKey),

   /**
    * @param {String} key
    * @param {String|Object} hashKeyOrValue
    * @param {Object} [value] Value to cache if hash key is given
    * @returns {Promise}
    */
   add: (key, hashKeyOrValue, value) => redis.add(prefix + key, hashKeyOrValue, value),

   /**
    * All keys with standard prefix
    * @returns {Promise.<String[]>}
    */
   keys: ()=> redis.keys(prefix + '*'),

   /**
    * Remove cached items
    * @param {String|String[]} key
    * @param {String|String[]} [hashKey]
    * @returns {Promise}
    */
   remove: (key, hashKey) => redis.remove(
      is.array(key) ? key.map(k => prefix + k) : prefix + key,
      hashKey),

   /**
    * Cache rendered views
    */
   view: {
      /**
       * @param {String} key Page slug
       * @returns {Promise}
       */
      item: key => redis.getObject(viewKey, key),

      /**
       * @returns {Promise.<String[]>}
       */
      keys: ()=> redis.keys(viewKey),

      /**
       * Create output cache item
       * @param {String} key Page slug
       * @param {String|Buffer} buffer
       * @returns {ViewCacheItem}
       */
      create: (key, buffer) => ({
         //buffer: (typeof buffer === is.type.STRING) ? new Buffer(buffer, 'hex') : buffer,
         buffer: (typeof buffer === is.type.STRING) ? Buffer.from(buffer) : buffer,
         eTag: key + '_' + (new Date()).getTime().toString()
      }),

      /**
       * Add or replace value at key
       * @param {String} key Page slug
       * @param {Buffer|String} buffer Zipped view content
       * @returns {Promise.<ViewCacheItem>}
       */
      add(key, buffer) {
         const item = this.create(key, buffer);
         return (config.cache.views) ? redis.add(viewKey, key, item) : Promise.resolve(item);
      },

      /**
       * Whether cache view exists
       * @param {String} key
       * @returns {Promise.<Boolean>}
       */
      exists: key => exists(viewKey, key, config.cache.views),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       * @param {String} key Page slug
       * @param {Buffer|String} buffer Zipped view content
       * @returns {Promise}
       */
      addIfMissing(key, buffer) {
         return (config.cache.views)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      /**
       * Remove cached page views
       * @param {String|String[]} keys
       * @returns {Promise}
       */
      remove: keys => redis.remove(viewKey, keys),

      /**
       * Whether object is a cached view
       * @param {Object|ViewCacheItem} o
       */
      is: o => (is.value(o) && is.defined(o, 'buffer') && is.defined(o, 'eTag')),

      /**
       * Convert view cache to string
       * @param {ViewCacheItem} v
       */
      serialize: v => JSON.stringify({ buffer: v.buffer.toString('hex'), eTag: v.eTag })
   },
   /**
    * Cache GeoJSON
    */
   map: {
      /**
       * @param {String} key Page slug
       * @returns {Promise}
       */
      item: key => redis.getObject(mapKey, key),

      /**
       * @returns {Promise.<String[]>}
       */
      keys: ()=> redis.keys(mapKey),

      /**
       * Add or replace value at key
       * @param {String} key Page slug
       * @param {Buffer|String} buffer Zipped GeoJSON
       * @returns {Promise}
       */
      add: (key, buffer) => (config.cache.maps) ? redis.add(mapKey, key, buffer) : Promise.resolve(),

      /**
       * Whether cache map exists
       * @param {String} key
       * @returns {Promise.<Boolean>}
       */
      exists: key => exists(mapKey, key, config.cache.maps),

      /**
       * Remove cached GeoJSON
       * @param {String|String[]} key
       * @returns {Promise}
       */
      remove: key => redis.remove(mapKey, key),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       * @param {String} key Page slug
       * @param {Buffer|String} buffer Zipped view content
       * @returns {Promise}
       */
      addIfMissing(key, buffer) {
         return (config.cache.maps)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },
   }
};