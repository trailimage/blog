'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.Provider.Cache
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

/**
 * Expected hash response used for validation and parsing
 * @return {Object.<String, Number>}
 */
CacheNamespace.DataType = {
	NONE: 0,            // don't check the reply
	OKAY: 1,            // check for 'OK'
	COUNT: 2,           // reply should match key count
	BIT: 3,             // 1 or 0
	RAW: 4,             // return raw data without validation or parsing
	JSON: 5             // parse as JSON
};

/**
 * @returns {Object.<String, String>}
 */
CacheNamespace.EventType = {
	CONNECTED: 'connected',
	FATAL: 'fatal'
};

module.exports = CacheNamespace;