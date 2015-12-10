'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 */
class CacheNamespace {
	/**
	 * @return {CacheBase}
	 * @constructor
	 */
	static get Base() { return require('./cache-base.js'); }

	/**
	 * @return {CacheHelper}
	 * @constructor
	 */
	static get Helper() { return require('./cache-helper.js'); }

	/**
	 * @return {CacheItem}
	 * @constructor
	 */
	static get Item() { return require('./cache-item.js'); }

	/**
	 * @return {MemoryCache}
	 * @constructor
	 */
	static get Memory() { return require('./memory-cache.js'); }

	/**
	 * @return {ModelCache}
	 * @constructor
	 */
	static get Model() { return require('./model-cache.js'); }

	/**
	 * @returns {RedisCache}
	 * @constructor
	 */
	static get Redis() { return require('../providers/redis/redis-cache.js'); }

	/**
	 * @returns {SqlCache}
	 * @constructor
	 */
	static get SQL() { return require('../providers/sql/sql-cache.js'); }
}

module.exports = CacheNamespace;