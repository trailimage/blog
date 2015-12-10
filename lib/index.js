'use strict';

/** @type {ProviderManager} */
let _provider = null;
const _enum = require('./enum.js');

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * Modules without dependencies can be initialized immediately
 */
class AppNamespace {
	static get is() { return require('./is.js'); }
	static get re() { return require('./regex.js'); }
	static get format() { return require('./format.js'); }
	static get config() { return require('./config.js'); }

	/**
	 * @returns {LogBase}
	 */
	static get log() { return AppNamespace.active.log; }

	/**
	 * @returns {CacheHelper}
	 */
	static get cache() { return AppNamespace.active.cache; }

	/**
	 * Dependency injected providers
	 * @returns {ProviderManager}
	 */
	static get active() {
		if (_provider === null) {
			const ProviderManager = require('./providers/manager.js');
			_provider = new ProviderManager();
		}
		return _provider;
	}

	/**
	 * @returns {EXIF}
	 * @constructor
	 */
	static get EXIF() { return require('./models/exif.js'); }

	/**
	 * @returns {Library}
	 * @constructor
	 */
	static get Library() { return require('./models/library.js'); }

	/**
	 * @returns {Post}
	 * @constructor
	 */
	static get Post() { return require('./models/post.js'); }
}

AppNamespace.enum = _enum;
AppNamespace.icon = _enum.icon;
AppNamespace.httpStatus = _enum.httpStatus;
AppNamespace.mimeType = _enum.mimeType;
AppNamespace.template = require('./template.js');

/**
 * @type {ProviderNamespace}
 */
AppNamespace.Provider = require('./providers');

/**
 * @returns {MapNamespace}
 * @constructor
 */
AppNamespace.Map = require('./map');

/**
 * @returns {AuthNamespace}
 * @constructor
 */
AppNamespace.Auth = require('./auth');

/**
 * @returns {FactoryNamespace}
 * @constructor
 */
AppNamespace.Factory = require('./models');

/**
 * @returns {MiddlewareNamespace}
 * @constructor
 */
AppNamespace.Middleware = require('./middleware');

/**
 * @returns {ControllerNamespace}
 * @constructor
 */
AppNamespace.Controller = require('./controllers');

/**
 * @returns {Photo}
 * @constructor
 */
AppNamespace.Photo = require('./models/photo.js');

/**
 * @returns {PostTag}
 * @constructor
 */
AppNamespace.PostTag = require('./models/post-tag.js');

/**
 * @returns {Size}
 * @constructor
 */
AppNamespace.PhotoSize = require('./models/size.js');

/**
 * @returns {Video}
 * @constructor
 */
AppNamespace.Video = require('./models/video.js');

module.exports = AppNamespace;