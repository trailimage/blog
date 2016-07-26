'use strict';

const is = require('./is');
const config = require('./config');
const redis = require('./redis');
const prefix = { INPUT: 'input:', OUTPUT: 'output:' };

module.exports = {
   /**
    * Cache input data
    */
   input: {
      /**
       * @param {String} hashName
       * @param {String} id
       * @returns {Promise}
       */
      getJSON(hashName, id) { return redis.getObject(prefix.INPUT + hashName, id); },

      /**
       * @param {String} hashName
       * @param {String} id
       * @param {Object} json
       * @returns {Promise}
       */
      add(hashName, id, json) { return redis.add(prefix.INPUT + hashName, id, json); }
   },

   /**
    * Cache rendered outputs
    */
   ouput: {
      getView(key) {},

      item(key, buffer) {
         return {
            buffer: (typeof buffer === 'string') ? new Buffer(buffer, 'hex') : buffer,
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