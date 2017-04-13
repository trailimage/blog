const is = require('./is');
const C = require('./constants');
const config = require('./config');
const redis = require('./redis');
// http://nodejs.org/api/zlib.html
const compress = require('zlib');
// Redis uses colon prefix as a kind of namespace
const prefix = 'api:';
const viewKey = 'view';
const mapKey = 'map';
/**
 * @type {object.<ViewCacheItem>}
 */
const memory = {};

/**
 * Whether key with prefix exists
 * @param {string} key
 * @param {string} hashKey
 * @param {boolean} enabled Whether caching is enabled
 * @returns {Promise.<boolean>}
 */
const exists = (key, hashKey, enabled) => enabled
   ? redis.exists(key, hashKey)
   : Promise.resolve(false);

/**
 * Create view cache item with eTag and compressed content
 * @param {string} key Page slug
 * @param {string|GeoJSON.FeatureCollection} htmlOrJSON
 * @returns {Promise.<ViewCacheItem>}
 */
const createItem = (key, htmlOrJSON) => new Promise((resolve, reject) => {
   const text = (typeof(htmlOrJSON) == is.type.OBJECT) ? JSON.stringify(htmlOrJSON) : htmlOrJSON;
   compress.gzip(text, (err, buffer) => {
      if (is.value(err)) {
         reject(err);
      } else {
         resolve({ buffer, eTag: key + '_' + (new Date()).getTime().toString() });
      }
   });
});

/**
 * @param {string} key Root Redis key
 * @param {string} hashKey Hash field key
 * @param {string|GeoJSON.FeatureCollection} value HTML or JSON
 * @param {boolean} enabled Whether caching for this root key is enabled
 * @returns {Promise.<ViewCacheItem>}
 */
const addItem = (key, hashKey, value, enabled) => createItem(hashKey, value)
   .then(item => (enabled) ? redis.add(key, hashKey, item) : Promise.resolve(item));

/**
 * Convert view cache to string
 * @param {ViewCacheItem} item
 * @returns {object}
 */
const serializeItem = item => JSON.stringify({
   buffer: item.buffer.toString(C.encoding.HEXADECIMAL),
   eTag: item.eTag
});

/**
 * @param {ViewCacheItem} item
 * @returns {object}
 */
const deserialize = item => is.value(item)
   ? { buffer: Buffer.from(item.buffer, C.encoding.HEXADECIMAL), eTag: item.eTag }
   : null;

/**
 * Manage cache interaction
 */
module.exports = {
   prefix,
   /**
    * Retrieve cached value
    * @param {string} key
    * @param {string} [hashKey]
    * @returns {Promise}
    */
   getItem: (key, hashKey) => redis.getObject(prefix + key, hashKey),

   /**
    * @param {string} key
    * @param {string|object} hashKeyOrValue
    * @param {object} [value] Value to cache if hash key is given
    * @returns {Promise}
    */
   add: (key, hashKeyOrValue, value) => redis.add(prefix + key, hashKeyOrValue, value),

   /**
    * All keys with standard prefix
    * @returns {Promise.<string[]>}
    */
   keys: ()=> redis.keys(prefix + '*'),

   /**
    * Remove cached items
    * @param {string|string[]} key
    * @param {string|string[]} [hashKey]
    * @returns {Promise}
    */
   remove: (key, hashKey) => redis.remove(
      is.array(key) ? key.map(k => prefix + k) : prefix + key,
      hashKey
   ),

   /**
    * Cache rendered views in memory
    */
   view: {
      /**
       * @param {string} key Page slug
       * @returns {Promise.<ViewCacheItem>}
       */
      getItem: key => Promise.resolve(memory[key]),

      /**
       * @returns {Promise.<string[]>}
       */
      keys: ()=> Promise.resolve(Object.keys(memory)),

      /**
       * Add or replace value at key
       * @param {string} key Page slug
       * @param {Buffer|string} text HTML or JSON
       * @returns {Promise.<ViewCacheItem>}
       */
      add: (key, text) => createItem(key, text).then(item => {
         if (config.cache.views) { memory[key] = item; }
         return Promise.resolve(item);
      }),

      create: createItem,

      /**
       * Whether cache view exists
       * @param {string} key
       * @returns {Promise.<boolean>}
       */
      exists: key => Promise.resolve(is.defined(memory, key)),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       * @param {string} key Page slug
       * @param {Buffer|string} buffer Zipped view content
       * @returns {Promise}
       */
      addIfMissing(key, buffer) {
         return (config.cache.views)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      /**
       * Remove cached page views
       * @param {string|string[]} keys
       * @returns {Promise}
       */
      remove: keys => {
         if (is.array(keys)) {
            keys.forEach(k => delete memory[k]);
         } else {
            delete memory[keys];
         }
         return Promise.resolve();
      },

      /**
       * In-memory cache doesn't need to serialize the page buffer
       * @param {ViewCacheItem} item
       * @returns {object}
       */
      serialize: item => item
   },

   /**
    * Cache rendered views in Redis
    */
   redisView: {
      /**
       * @param {string} key Page slug
       * @returns {Promise.<ViewCacheItem>}
       */
      getItem: key => redis.getObject(viewKey, key).then(deserialize),

      /**
       * @returns {Promise.<string[]>}
       */
      keys: ()=> redis.keys(viewKey),

      /**
       * Add or replace value at key
       * @param {string} key Page slug
       * @param {string} text HTML or JSON
       * @returns {Promise.<ViewCacheItem>}
       */
      add: (key, text) => addItem(viewKey, key, text, config.cache.views),

      create: createItem,

      /**
       * Whether cache view exists
       * @param {string} key
       * @returns {Promise.<boolean>}
       */
      exists: key => exists(viewKey, key, config.cache.views),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       * @param {string} key Page slug
       * @param {Buffer|string} buffer Zipped view content
       * @returns {Promise}
       */
      addIfMissing(key, buffer) {
         return (config.cache.views)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      /**
       * Remove cached page views
       * @param {string|string[]} keys
       * @returns {Promise}
       */
      remove: keys => redis.remove(viewKey, keys),

      serialize: serializeItem
   },
   /**
    * Cache GeoJSON
    */
   map: {
      /**
       * @param {string} key Page slug
       * @returns {Promise.<ViewCacheItem>}
       */
      getItem: key => redis.getObject(mapKey, key).then(deserialize),

      /**
       * @returns {Promise.<string[]>}
       */
      keys: ()=> redis.keys(mapKey),

      /**
       * Add or replace value at key
       * @param {string} key Page slug
       * @param {GeoJSON.FeatureCollection} geoJSON Zipped view content
       * @returns {Promise.<ViewCacheItem>}
       */
      add: (key, geoJSON) => addItem(mapKey, key, geoJSON, config.cache.maps),
      
      /**
       * Whether cache map exists
       * @param {string} key
       * @returns {Promise.<boolean>}
       */
      exists: key => exists(mapKey, key, config.cache.maps),

      /**
       * Remove cached GeoJSON
       * @param {string|string[]} key
       * @returns {Promise}
       */
      remove: key => redis.remove(mapKey, key),

      /**
       * Add value only if it doesn't already exist (mainly for testing)
       * @param {string} key Page slug
       * @param {Buffer|string} buffer Zipped view content
       * @returns {Promise}
       */
      addIfMissing(key, buffer) {
         return (config.cache.maps)
            ? this.exists(key).then(exists => exists ? Promise.resolve() : this.add(key, buffer))
            : Promise.resolve();
      },

      serialize: serializeItem
   }
};