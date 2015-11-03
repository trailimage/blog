'use strict';

const CacheHelper = require('../cache/cache-helper.js');
const ConsoleLog = require('../log/console-log.js');

/**
 * Manage data providers
 */
class ProviderManager {

	constructor() {
		/** @type {DataBase} */
		this.data = null;
		/** @type {LogBase} */
		this.log = new ConsoleLog();
		/** @type {CacheHelper} */
		this.cache = null;
	}

	/**
	 * Assign provider used by cache helper
	 * @param {CacheBase} provider
	 */
	set cacheHost(provider) {
		this.cache = new CacheHelper(provider);
	}
}

module.exports = ProviderManager;