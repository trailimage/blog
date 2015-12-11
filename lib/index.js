'use strict';

/** @type {ProviderManager} */
let _provider = null;
const _enum = require('./enum.js');

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * Modules without dependencies can be initialized immediately
 * @namespace TI
 */
class RootNamespace {
	/** @namespace TI.is */
	static get is() { return require('./is.js'); }
	static get re() { return require('./regex.js'); }
	static get format() { return require('./format.js'); }
	/** @namespace TI.config */
	static get config() { return require('./config.js'); }

	static get log() { return RootNamespace.active.log; }

	static get cache() { return RootNamespace.active.cache; }

	/**
	 * Dependency injected providers
	 * @namespace TI.active
	 * @type {ProviderManager}
	 */
	static get active() {
		if (_provider === null) {
			const ProviderManager = require('./providers/manager.js');
			_provider = new ProviderManager();
		}
		return _provider;
	}

	/**
	 * @constructor
	 */
	static get EXIF() { return require('./models/exif.js'); }

	/**
	 * @constructor
	 */
	static get Library() { return require('./models/library.js'); }

	/**
	 * @constructor
	 */
	static get Post() { return require('./models/post.js'); }
}

/** @namespace TI.enum */
RootNamespace.enum = _enum;
RootNamespace.icon = _enum.icon;
RootNamespace.httpStatus = _enum.httpStatus;
RootNamespace.mimeType = _enum.mimeType;
RootNamespace.template = require('./template.js');

/**
 * @namespace TI.PDF
 * @constructor
 */
RootNamespace.PDF = require('./pdf');

/**
 * @type {TI.Provider}
 * @constructor
 */
RootNamespace.Provider = require('./providers');

/**
 * @namespace TI.Map
 * @constructor
 */
RootNamespace.Map = require('./map');

/**
 * @returns {AuthNamespace}
 * @namespace TI.Auth
 * @constructor
 */
RootNamespace.Auth = require('./auth');

/**
 * @returns {FactoryNamespace}
 * @namespace TI.Factory
 * @constructor
 */
RootNamespace.Factory = require('./models');

/**
 * @returns {MiddlewareNamespace}
 * @constructor
 */
RootNamespace.Middleware = require('./middleware');

/**
 * @returns {ControllerNamespace}
 * @constructor
 */
RootNamespace.Controller = require('./controllers');

/**
 * @returns {TI.Photo}
 * @constructor
 */
RootNamespace.Photo = require('./models/photo.js');

/**
 * @returns {TI.PostTag}
 * @constructor
 */
RootNamespace.PostTag = require('./models/post-tag.js');

/**
 * @returns {TI.PhotoSize}
 * @constructor
 */
RootNamespace.PhotoSize = require('./models/photo-size.js');

/**
 * @returns {TI.Video}
 * @constructor
 */
RootNamespace.Video = require('./models/video.js');


module.exports = RootNamespace;