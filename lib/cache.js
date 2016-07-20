'use strict';

const is = require('./is');
const config = require('./config');
const redis = require('./redis');
// the parent key under which all library objects are cached
// Redis uses a colon for visual grouping (no impact to data structure)
const keyPrefix = 'model:';
/**
 * Root element name in the hash referenced by the parent cache key
 * @type Object.<String>
 * @example <cacheKey> = { <rootKey>: value }
 */
const key = {
   ROOT: 'root',
   POSTS: keyPrefix + 'library',
   TAGS: keyPrefix + 'photoTags'
};

let queue = {};

module.exports = {
   /**
    * Raw posts and collection heirarchy from Flickr
    * @param {function(Object, Object)} callback
    * @see http://www.flickr.com/services/api/flickr.collections.getTree.html
    */
   getPosts(callback) {
      if (config.cacheOutput) {
         redis.getAll(key.POSTS, data => {
            let tree = null;
            if (data !== null && is.defined(key.ROOT, data)) {
               // separate collection heirarchy (tree) from set summaries (data)
               tree = JSON.parse(data[key.ROOT]);
               delete data[key.ROOT];
            }
            callback(data, tree);
         });
      } else {
         callback(null, null);
      }
   },

   // region Photo Tags

   /**
    * Parsed photo tags
    * @param {function(Object.<String>)} callback
    */
   getPhotoTags(callback) {
      if (config.cacheOutput) {
         redis.getObject(key.TAGS, callback);
      } else {
         callback(null);
      }
   },

   /**
    * Photo tags are cached directly, not queued
    * @param {Object.<String>} tags
    */
   addPhotoTags(tags) { redis.add(key.TAGS, tags); },

   /**
    * @param {function(Boolean)} callback
    */
   removePhotoTags(callback) {
      if (config.cacheOutput) {
         redis.remove(key.TAGS, callback);
      } else {
         callback(false);
      }
   },

   // endregion

   clear() { redis.remove(key.POSTS); },

   // region Queue

   /**
    * Add value to cache queue
    * @param {Object} value
    */
   enqueue(value) { queue[rootKey] = JSON.stringify(value); },

   /**
    * Add item to pending cache
    * @param {String} postID
    * @param {Object|String} value
    */
   queuePost(postID, value) { queue[postID] = JSON.stringify(value); },

   /**
    * @param {String} name
    */
   dequeue(name) { delete queue[name]; },

   /**
    * Write cache
    */
   flush() {
      if (config.cacheOutput) { redis.addAll(postsKey, queue); }
      queue = {};
   },

   // endregion

   view: {
      item(key, buffer) {
         return {
            buffer: (typeof buffer === 'string') ? new Buffer(buffer, 'hex') : buffer,
            eTag: key + '_' + (new Date()).getTime().toString()
         };
      },
      // add HTML output content
      add(key, slug, buffer, callback) {
         let ci = this.item(slug, buffer);

         if (config.cacheOutput) {
            redis.add(key, slug, ci, success => {
               if (is.callable(callback)) { callback(success ? ci : null); }
            });
         } else {
            callback(ci);
         }
      },
      // whether object is a view cache
      is: o => (is.value(o) && is.defined(o, 'buffer') && is.defined(o, 'eTag')),
      serialize: v => JSON.stringify({ buffer: v.buffer.toString('hex'), eTag: v.eTag })
   }
};