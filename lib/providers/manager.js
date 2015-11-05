'use strict';

const CacheHelper = require('../cache/cache-helper.js');

/**
 * Manage data providers
 */
class ProviderManager {

	constructor() {
		/** @type {DataBase} */
		this.data = null;
		/**
		 * @type {LogBase}
		 * @private;
		 */
		this._log = null;
		/**
		 * @type {Boolean}
		 * @private
		 */
		this._logReady = false;
		/**
		 * @type {CacheHelper}
		 * @private
		 */
		this._cache = null;
		/**
		 * @type {Boolean}
		 * @private
		 */
		this._cacheReady = false;
		/**
		 * @type {FileBase}
		 * @private;
		 */
		this._files = null;
		/**
		 * @type {Boolean}
		 * @private
		 */
		this._filesReady = false;
	}

	/**
	 * @returns {CacheHelper}
	 */
	get cache() {
		if (!this._cacheReady) {
			// if no cache provider has been assigned then default to in-memory
			const MemoryCache = require('../cache/memory-cache.js');
			this.cacheHost = new MemoryCache();
		}
		return this._cache;
	}

	/**
	 * @returns {LogBase}
	 */
	get log() {
		if (!this._logReady) {
			// if no log provider has been assigned then default to console
			const ConsoleLog = require('../log/console-log.js');
			this.log = new ConsoleLog();
		}
		return this._log;
	}

	/**
	 * @param {LogBase} provider
	 */
	set log(provider) {
		this._log = provider;
		this._logReady = true;
	}

	/**
	 * @returns {FileBase}
	 */
	get files() {
		if (!this._filesReady) {

		}
		return this._files;
	}

	/**
	 * @param {FileBase} provider
	 */
	set files(provider) {
		this._files = provider;
		this._filesReady = true;
	}

	/**
	 * Assign provider used by cache helper
	 * @param {CacheBase} provider
	 */
	set cacheHost(provider) {
		this._cache = new CacheHelper(provider);
		this._cacheReady = true;
	}
}

module.exports = ProviderManager;