'use strict';

class CacheIndex {
	/** @return {CacheBase} */
	static get Base() { return require('./cache-base.js'); }
	/** @return {CacheHelper} */
	static get Helper() { return require('./cache-helper.js'); }
	/** @return {CacheItem} */
	static get Item() { return require('./cache-item.js'); }
	/** @return {MemoryCache} */
	static get Memory() { return require('./memory-cache.js'); }
	/** @return {ModelCache} */
	static get Model() { return require('./model-cache.js'); }

	// providers
	static get Redis() { return require('../providers/redis/redis-cache.js'); }
}

module.exports = CacheIndex;