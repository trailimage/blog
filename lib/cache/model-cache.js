'use strict';

const TI = require('../index.js');
const is = TI.is;
const config = TI.config;
const cache = TI.active.cache;

/**
 * Manage model cache
 * Load posts and post tags before writing out to cache
 * @alias TI.Provider.Cache.Model
 */
class ModelCache {
	/**
	 * Raw posts and collection heirarchy from source
	 * @param {function(Object, Object)} callback
	 * @see http://www.flickr.com/services/api/flickr.collections.getTree.html
	 */
	static getPosts(callback) {
		if (config.cacheOutput) {
			cache.getAll(ModelCache.postsKey, data => {
				let tree = null;

				if (data !== null && is.defined(ModelCache.rootKey, data)) {
					tree = JSON.parse(data[ModelCache.rootKey]);
					delete data[ModelCache.rootKey];
				}
				callback(data, tree);
			});
		} else {
			callback(null, null);
		}
	}

	/**
	 * Parsed photo tags
	 * @param {function(Object.<String>)} callback
	 */
	static getPhotoTags(callback) {
		if (config.cacheOutput) {
			cache.getObject(ModelCache.tagsKey, callback);
		} else {
			callback(null);
		}
	}

	/**
	 * Photo tags are cached directly, not queued
	 * @param {Object.<String>} tags
	 */
	static addPhotoTags(tags) { cache.add(ModelCache.tagsKey, tags); }

	/**
	 * @param {function(Boolean)} callback
	 */
	static removePhotoTags(callback) {
		if (config.cacheOutput) {
			cache.remove(ModelCache.tagsKey, callback);
		} else {
			callback(false);
		}
	}

	static clear() {
		cache.remove(ModelCache.postsKey);
	}

	/**
	 * Add value to cache queue
	 * @param {Object} value
	 */
	static enqueue(value) {
		ModelCache.queue[ModelCache.rootKey] = JSON.stringify(value);
	}

	/**
	 * Add item to pending cache
	 * @param {String} postID
	 * @param {Object|String} value
	 * @private
	 */
	static queuePost(postID, value) {
		ModelCache.queue[postID] = JSON.stringify(value);
	}

	/**
	 * @param {String} name
	 * @private
	 */
	static dequeue(name) { delete ModelCache.queue[name]; }

	/**
	 * Write cache
	 */
	static flush() {
		if (config.cacheOutput) { cache.addAll(ModelCache.postsKey, ModelCache.queue); }
		ModelCache.queue = {};
	}
}

/**
 * Queue library source data for caching while it's being lazy-loaded
 * @type {Object.<Object>}
 */
ModelCache.queue = {};

/**
 * The parent key under which all library objects are cached
 * Redis uses a colon for visual grouping (no impact to data structure)
 * @type {string}
 */
ModelCache.keyPrefix = 'model:';
/**
 * Root element name in the hash referenced by the parent cache key
 * @type {string}
 * @example <cacheKey> = { <rootKey>: value }
 */
ModelCache.rootKey = 'root';
ModelCache.postsKey = ModelCache.keyPrefix + 'library';
ModelCache.tagsKey = ModelCache.keyPrefix + 'photoTags';

module.exports = ModelCache;