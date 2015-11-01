'use strict';

const CacheHelper = require('./cache-helper.js');
const ConsoleLog = require('./console-log.js');

/**
 * Manage data providers
 */
class ProviderManager {

	constructor() {
		/** @type {LibraryProvider} */
		this.library = null;
		/** @type {LogProvider} */
		this.log = new ConsoleLog();
		/** @type {CacheHelper} */
		this.cache = null;
	}

	/**
	 * Assign provider used by cache helper
	 * @param {CacheProvider} provider
	 */
	set cacheHost(provider) {
		this.cache = new CacheHelper(provider);
	}
}

module.exports = ProviderManager;