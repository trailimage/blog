'use strict';

const is = require('./is');
const config = require('./config');
const redis = require('./redis');
const prefix = { INPUT: 'input:', OUTPUT: 'output:' };

module.exports = {
   /**
    * @param {String} hashName
    * @param {String} [id]
    * @returns {Promise}
    */
   getObject(hashName, id) { return redis.getObject(prefix.INPUT + hashName, id); },

   /**
    * @param {String} hashName
    * @param {String|Object} idOrObject
    * @param {Object} [o]
    * @returns {Promise}
    */
   add(hashName, idOrObject, o) { return redis.add(prefix.INPUT + hashName, idOrObject, o); },

   /**
    * Cache rendered outputs
    */
   output: {
      getView(key) {},

      item(key, buffer) {
         return {
            buffer: (typeof buffer === is.type.STRING) ? new Buffer(buffer, 'hex') : buffer,
            eTag: key + '_' + (new Date()).getTime().toString()
         };
      },
      /**
       * @param {String} key
       * @param {String} slug
       * @param {Buffer|String} buffer Zipped view content
       * @returns {Promise}
       */
      add(key, slug, buffer) {
         let view = this.item(slug, buffer);
         return (config.cache.views) ? redis.add(key, slug, view) : Promise.resolve(view);
      },
      /**
       * Whether object is a cached view
       * @param {Object} o
       */
      is: o => (is.value(o) && is.defined(o, 'buffer') && is.defined(o, 'eTag')),
      /**
       * Convert view cache to string
       * @param {Object} v
       */
      serialize: v => JSON.stringify({ buffer: v.buffer.toString('hex'), eTag: v.eTag })
   }
};