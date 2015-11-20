'use strict';

const is = require('../is.js');
const config = require('../config.js');
const cache = config.provider.cache;

/**
 * Manage model cache
 * Load posts and post tags before writing out to cache
 */
class ModelCache {
	/**
	 * Raw posts and collection heirarchy from source
	 * @param {function(Object, Object)} callback
	 * @see http://www.flickr.com/services/api/flickr.collections.getTree.html
	 */
	static getPosts(callback) {
		if (config.cacheOutput) {
			cache.getAll(postsKey, data => {
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
	}

	/**
	 * Parsed photo tags
	 * @param {function(Object.<String>)} callback
	 */
	static getPhotoTags(callback) {
		if (config.cacheOutput) {
			cache.getObject(tagsKey, callback);
		} else {
			callback(null);
		}
	}

	/**
	 * Photo tags are cached directly, not queued
	 * @param {Object.<String>} tags
	 */
	static addPhotoTags(tags) { cache.add(tagsKey, tags); }

	/**
	 * @param {function(Boolean)} callback
	 */
	static removePhotoTags(callback) {
		if (config.cacheOutput) {
			cache.remove(tagsKey, callback);
		} else {
			callback(false);
		}
	}

	static clear() {
		cache.remove(postsKey);
	}

	/**
	 * Add value to cache queue
	 * @param value
	 */
	static enqueue(value) {
		cacheQueue[rootKey] = JSON.stringify(value);
	}

	/**
	 * Add item to pending cache
	 * @param {String} postID
	 * @param {Object|String} value
	 * @private
	 */
	static queuePost(postID, value) {
		cacheQueue[postID] = JSON.stringify(value);
	}

	/**
	 * @param {String} name
	 * @private
	 */
	static dequeue(name) { delete cacheQueue[name]; }

	/**
	 * Write cache
	 * @private
	 */
	static flush() {
		if (config.cacheOutput) { cache.addAll(postsKey, cacheQueue); }
		cacheQueue = {};
	}

	/** @returns {string} */
	static get keyPrefix() { return keyPrefix; }
	/** @returns {string} */
	static get postsKey() { return postsKey; }
	/** @returns {string} */
	static get tagsKey() { return tagsKey; }
}

module.exports = ModelCache;

// - Private static members ---------------------------------------------------

const keyPrefix = 'model:';

/**
 * The parent key under which all library objects are cached
 * Redis uses a colon for visual grouping (no impact to data structure)
 * @type {string}
 */
const postsKey = keyPrefix + 'library';
const tagsKey = keyPrefix + 'photoTags';
/**
 * Root element name in the hash referenced by the parent cacheKey
 * @type {string}
 * @example <cacheKey> = { <rootKey>: value }
 */
const rootKey = 'root';
/**
 * Queue library source data for caching while it's being lazy-loaded
 * @type {Object.<Object>}
 */
let cacheQueue = {};