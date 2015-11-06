'use strict';

const is = require('../is.js');
const CacheHelper = require('../cache/cache-helper.js');

/**
 * Manage data providers
 */
class ProviderManager {

	constructor() {
		/**
		 * Whether one of the providers requires authorization
		 * @type {boolean}
		 */
		this.needsAuth = false;

		/**
		 * @type {PhotoBase}
		 * @private
		 */
		this._photo = null;
		/**
		 * @type {Boolean}
		 * @private
		 */
		this._photoReady = false;
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
	 * @param {PhotoBase} provider
	 */
	set photo(provider) {
		if (is.value(provider)) {
			this._photo = provider;
			this._photoReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}

	/**
	 * @returns {PhotoBase}
	 */
	get photo() {
		if (!this._photoReady) {

		}
		return this._photo;
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
		if (is.value(provider)) {
			this._files = provider;
			this._filesReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}

	/**
	 * Assign provider used by cache helper
	 * @param {CacheBase} provider
	 */
	set cacheHost(provider) {
		if (is.value(provider)) {
			this._cache = new CacheHelper(provider);
			this._cacheReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}
}

module.exports = ProviderManager;