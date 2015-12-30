'use strict';

const TI = require('../');
const is = TI.is;

/**
 * Manage data providers
 */
class ProviderManager {

	constructor() {
		/**
		 * Whether one of the providers requires authorization
		 * @type boolean
		 */
		this.needsAuth = false;

		/**
		 * @type PhotoProviderBase
		 * @private
		 */
		this._photo = null;

		/**
		 * @type Boolean
		 * @private
		 */
		this._photoReady = false;

		/**
		 * @type VideoProviderBase
		 * @private
		 */
		this._video = null;

		/**
		 * @type Boolean
		 * @private
		 */
		this._videoReady = false;

		/**
		 * @type {LogBase|ConsoleLog}
		 * @private;
		 */
		this._log = null;
		/**
		 * @type Boolean
		 * @private
		 */
		this._logReady = false;
		/**
		 * @type CacheHelper
		 * @private
		 */
		this._cache = null;
		/**
		 * @type Boolean
		 * @private
		 */
		this._cacheReady = false;
		/**
		 * @type FileProviderBase
		 * @private;
		 */
		this._file = null;
		/**
		 * @type Boolean
		 * @private
		 */
		this._fileReady = false;
	}

	/**
	 * @param {PhotoProviderBase|TI.Provider.Photo.Flickr|FlickrPhoto} provider
	 */
	set photo(provider) {
		if (is.value(provider)) {
			this._photo = provider;
			this._photoReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}

	/**
	 * @returns {PhotoProviderBase|TI.Provider.Photo.Flickr|FlickrPhoto}
	 */
	get photo() {
		if (!this._photoReady) {

		}
		return this._photo;
	}

	/**
	 * @returns {VideoProviderBase}
	 */
	get video() {
		if (!this._videoReady) {

		}
		return this._video;
	}

	/**
	 * @param {VideoProviderBase} provider
	 */
	set video(provider) {
		if (is.value(provider)) {
			this._video = provider;
			this._videoReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}

	/**
	 * @returns {TI.Provider.Cache.Helper}
	 */
	get cache() {
		if (!this._cacheReady) {
			// if no cache provider has been assigned then default to in-memory
			this.cacheHost = new TI.Provider.Cache.Memory();
		}
		return this._cache;
	}

	/**
	 * @returns {LogBase|NullLog|ConsoleLog}
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
	 * @param {LogBase|NullLog|ConsoleLog} provider
	 */
	set log(provider) {
		this._log = provider;
		this._logReady = true;
	}

	/**
	 * @returns {FileProviderBase|TI.Provider.File.Google}
	 */
	get file() {
		if (!this._fileReady) {

		}
		return this._file;
	}

	/**
	 * @param {FileProviderBase|TI.Provider.File.Google} provider
	 */
	set file(provider) {
		if (is.value(provider)) {
			this._file = provider;
			this._fileReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}

	/**
	 * Assign provider used by cache helper
	 * @param {TI.Provider.Cache.Base|TI.Provider.Cache.Memory|TI.Provider.Cache.Redis} provider
	 */
	set cacheHost(provider) {
		if (is.value(provider)) {
			const CacheHelper = require('../cache/cache-helper.js');
			this._cache = new CacheHelper(provider);
			this._cacheReady = true;
			if (provider.needsAuth) { this.needsAuth = true; }
		}
	}
}

module.exports = ProviderManager;