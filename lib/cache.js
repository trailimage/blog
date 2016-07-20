'use strict';

const is = require('./is');
const config = require('./config');
const redis = require('./redis');
// the parent key under which all library objects are cached
// Redis uses a colon for visual grouping (no impact to data structure)
const keyPrefix = 'model:';
// root element name in the hash referenced by the parent cache key
// e.g. <cacheKey> = { <rootKey>: value }
const rootKey = 'root';
const postsKey = keyPrefix + 'library';
const tagsKey = keyPrefix + 'photoTags';

let queue = {};

module.exports = {
   // raw posts and collection heirarchy as returned by Flickr
   getPosts(callback) {
      if (config.cacheOutput) {
         redis.getAll(postsKey, data => {
            let tree = null;
            if (data !== null && is.defined(rootKey, data)) {
               // separate collection heirarchy (tree) from set summaries (data)
               tree = JSON.parse(data[rootKey]);
               delete data[rootKey];
            }
            callback(data, tree);
         });
      } else {
         callback(null, null);
      }
   },

   // region Photo Tags

   // parsed photo tags
   getPhotoTags(callback) {
      if (config.cacheOutput) {
         redis.getObject(tagsKey, callback);
      } else {
         callback(null);
      }
   },

   // photo tags are cached directly, not queued
   addPhotoTags(tags) { redis.add(tagsKey, tags); },
   removePhotoTags(callback) {
      if (config.cacheOutput) {
         redis.remove(tagsKey, callback);
      } else {
         callback(false);
      }
   },

   // endregion

   clear() { redis.remove(postsKey); },

   // region Queue

   // add value to cache queue
   enqueue(value) { queue[rootKey] = JSON.stringify(value); },

   // add item to pending cache
   queuePost(postID, value) { queue[postID] = JSON.stringify(value); },

   dequeue(name) { delete queue[name]; },

   // write cache
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