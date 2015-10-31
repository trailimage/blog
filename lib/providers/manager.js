'use strict';

const cacheHelper = require('./cache-helper.js');

/** @type {CacheProvider} */
let cacheProvider = null;

class ProviderManager {

	constructor() {
		/** @type {LibraryProvider} */
		this.library = null;
		/** @type {LogProvider} */
		this.log = null;
	}

	/**
	 *
	 * @param {CacheProvider} value
	 */
	set cache(value) {
		cacheProvider = value;
	}

	get cache() {
		return cacheHelper;
	}
}

module.exports = ProviderManager;