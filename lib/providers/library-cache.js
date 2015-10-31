'use strict';

const is = require('../is.js');
const log = require('../log.js');
const config = require('../config.js');
const Library = require('../models/library.js');
const cache = require('../cache.js');
/**
 * The parent key under which all library objects are cached
 * @type {string}
 */
const cacheKey = 'model:library';
const rootKey = 'root';
/**
 * Queue library source data for caching while it's being lazy-loaded
 * @type {Object.<Object>}
 */
let cacheQueue = {};

/**
 * Manage library cache
 */
class LibraryCache {
	/**
	 * Cached posts and collection heirarchy
	 * @param {function(Object, Object)} callback
	 */
	static load(callback) {
		cache.getAll(cacheKey, data => {
			let tree = null;

			if (data !== null) {
				tree = JSON.parse(data[rootKey]);
				delete data[rootKey];
			}
			callback(data, tree);
		});
	}

	static clear() {
		cache.remove(cacheKey);
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
		if (config.cacheOutput) { cache.addAll(cacheKey, cacheQueue); }
		cacheQueue = {};
	}
}

module.exports = LibraryCache;