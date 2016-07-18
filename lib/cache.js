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
   // raw posts and collection heirarchy from source
   getPosts(callback) {
      if (config.cacheOutput) {
         redis.getAll(postsKey, data => {
            let tree = null;

            if (data !== null && is.defined(rootKey, data)) {
               tree = JSON.parse(data[rootKey]);
               delete data[rootKey];
            }
            callback(data, tree);
         });
      } else {
         callback(null, null);
      }
   },

   // parsed photo tags
   getPhotoTags(callback) {
      if (config.cacheOutput) {
         redis.getObject(tagsKey, callback);
      } else {
         callback(null);
      }
   },



   // photo tags are cached directly, not queued
   addPhotoTags(tags) { cache.add(tagsKey, tags); },
   removePhotoTags(callback) {
      if (config.cacheOutput) {
         cache.remove(tagsKey, callback);
      } else {
         callback(false);
      }
   },

   clear() { cache.remove(postsKey); },

   // add value to cache queue
   enqueue(value) { queue[rootKey] = JSON.stringify(value); },

   // add item to pending cache
   aueuePost(postID, value) { queue[postID] = JSON.stringify(value); },

   dequeue(name) { delete queue[name]; },

   // write cache
   flush() {
      if (config.cacheOutput) { cache.addAll(postsKey, queue); }
      queue = {};
   },

   view: {
      item(key, buffer) {
         return {
            buffer: (typeof buffer === 'string') ? new Buffer(buffer, 'hex') : buffer,
            eTag: key + '_' + (new Date()).getTime().toString()
         };
      },
      // whether object is a view cache
      is: o => (is.value(o) && is.defined(o, 'buffer') && is.defined(o, 'eTag')),
      serialize: v => JSON.stringify({ buffer: v.buffer.toString('hex'), eTag: v.eTag })
   }
};