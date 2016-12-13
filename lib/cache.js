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
 * Whether key with prefix exists
 * @param {String} key
 * @param {String} hashKey
 * @param {Boolean} enabled Whether caching is enabled
 * @returns {Promise.<Boolean>}
 */
const exists = (key, hashKey, enabled) => enabled
   ? redis.exists(key, hashKey)
   : Promise.resolve(false);

//region Cache item

/**
 * Create view cache item with eTag and compressed content
 * @param {String} key Page slug
 * @param {String|GeoJSON.FeatureCollection} htmlOrJSON
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
 * @param {String} key Root Redis key
 * @param {String} hashKey Hash field key
 * @param {String|GeoJSON.FeatureCollection} value HTML or JSON
 * @param {Boolean} enabled Whether caching for this root key is enabled
 * @returns {Promise.<ViewCacheItem>}
 */
const addItem = (key, hashKey, value, enabled) => createItem(hashKey, value)
   .then(item => (enabled) ? redis.add(key, hashKey, item) : Promise.resolve(item));

/**
 * Convert view cache to string
 * @param {ViewCacheItem} item
 */
const serializeItem = item => JSON.stringify({
   buffer: item.buffer.toString(C.encoding.HEXADECIMAL),
   eTag: item.eTag
});

/**
 * @param {ViewCacheItem} item
 */
const deserialize = item => is.value(item)
   ? { buffer: Buffer.from(item.buffer, C.encoding.HEXADECIMAL), eTag: item.eTag }
   : null;

//endregion

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
   getItem: (key, hashKey) => redis.getObject(prefix + key, hashKey),

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
      hashKey
   ),

   /**
    * Cache rendered views
    */
   view: {
      /**
       * @param {String} key Page slug
       * @returns {Promise.<ViewCacheItem>}
       */
      getItem: key => redis.getObject(viewKey, key).then(deserialize),

      /**
       * @returns {Promise.<String[]>}
       */
      keys: ()=> redis.keys(viewKey),

      /**
       * Add or replace value at key
       * @param {String} key Page slug
       * @param {String} text HTML or JSON
       * @returns {Promise.<ViewCacheItem>}
       */
      add: (key, text) => addItem(viewKey, key, text, config.cache.views),

      create: createItem,

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

      serialize: serializeItem
   },
   /**
    * Cache GeoJSON
    */
   map: {
      /**
       * @param {String} key Page slug
       * @returns {Promise.<ViewCacheItem>}
       */
      getItem: key => redis.getObject(mapKey, key).then(deserialize),

      /**
       * @returns {Promise.<String[]>}
       */
      keys: ()=> redis.keys(mapKey),

      /**
       * Add or replace value at key
       * @param {String} key Page slug
       * @param {GeoJSON.FeatureCollection} geoJSON Zipped view content
       * @returns {Promise.<ViewCacheItem>}
       */
      add: (key, geoJSON) => addItem(mapKey, key, geoJSON, config.cache.maps),

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

      serialize: serializeItem
   }
};