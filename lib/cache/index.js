'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace
 * @alias TI.Provider.Cache
 */
class CacheNamespace {
	static get Base() { return require('./cache-base.js'); }
	static get Helper() { return require('./cache-helper.js'); }
	static get Item() { return require('./cache-item.js'); }
	static get Memory() { return require('./memory-cache.js'); }
	static get Model() { return require('./model-cache.js'); }
	static get Redis() { return require('../providers/redis/redis-cache.js'); }

	/**
	 * @namespace TI.Provider.Cache.SQL
	 * @constructor
	 */
	static get SQL() { return require('../providers/sql/sql-cache.js'); }
}

/**
 * Expected hash response used for validation and parsing
 * @returns {{Object.<String, Number>}}
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
 * @returns {{Object.<String, String>}}
 */
CacheNamespace.EventType = {
	CONNECTED: 'connected',
	FATAL: 'fatal'
};

module.exports = CacheNamespace;