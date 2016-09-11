'use strict';

const is = require('./is');
const config = require('./config');
const redis = require('./redis');
// Redis uses colon prefix as a kind of namespace
const prefix = 'api:';
const viewKey = 'view';
const mapKey = 'map';

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
    * Cache rendered views
    */
   view: {
      /**
       * @param {String} slug Page slug
       * @returns {Promise}
       */
      item: slug => redis.getObject(viewKey, slug),

      /**
       * @returns {Promise.<String[]>}
       */
      keys: ()=> redis.keys(viewKey),

      /**
       * Create output cache item
       * @param {String} slug Page slug
       * @param {String|Buffer} buffer
       * @returns {ViewCacheItem}
       */
      create: (slug, buffer) => ({
         buffer: (typeof buffer === is.type.STRING) ? new Buffer(buffer, 'hex') : buffer,
         eTag: slug + '_' + (new Date()).getTime().toString()
      }),

      /**
       * @param {String} slug Page slug
       * @param {Buffer|String} buffer Zipped view content
       * @returns {Promise}
       */
      add(slug, buffer) {
         const item = this.create(slug, buffer);
         return (config.cache.views) ? redis.add(viewKey, slug, item) : Promise.resolve(item);
      },

      /**
       * Remove cached page views
       * @param {String|String[]} slugs
       * @returns {Promise}
       */
      remove: slugs => redis.remove(viewKey, slugs),

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
       * @param {String} slug Page slug
       * @returns {Promise}
       */
      item: slug => redis.getObject(mapKey, slug),

      /**
       * @returns {Promise.<String[]>}
       */
      keys: ()=> redis.keys(mapKey),

      /**
       * Remove cached GeoJSON
       * @param {String|String[]} slugs
       * @returns {Promise}
       */
      remove: slugs => redis.remove(mapKey, slugs),
   }
};