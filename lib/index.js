'use strict';

/** @type ProviderManager */
let _provider = null;
const _enum = require('@trailimage/enum');
// so extensions are always applied
require('./extensions.js');

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * Modules without dependencies can be initialized immediately
 * @namespace
 * @alias TI
 */
class RootNamespace {
	static get is() { return require('@trailimage/is'); }
	static get re() { return require('./regex.js'); }
	static get format() { return require('./format.js'); }
	static get config() { return require('./config.js'); }
	static get log() { return RootNamespace.active.log; }
	static get cache() { return RootNamespace.active.cache; }

	/**
	 * Dependency injected providers
	 * @alias TI.active
	 * @type ProviderManager
	 */
	static get active() {
		if (_provider === null) {
			const ProviderManager = require('./providers/provider-manager.js');
			_provider = new ProviderManager();
		}
		return _provider;
	}

	static get EXIF() { return require('./models/exif.js'); }
	static get Library() { return require('./models/library.js'); }
	static get Post() { return require('./models/post.js'); }
}

/** @alias TI.enum */
RootNamespace.enum = _enum;
/** @alias TI.icon */
RootNamespace.icon = _enum.icon;
RootNamespace.httpStatus = _enum.httpStatus;
RootNamespace.mimeType = _enum.mimeType;
RootNamespace.template = require('./template.js');
RootNamespace.PDF = require('./pdf');
RootNamespace.Provider = require('./providers');
RootNamespace.Map = require('@trailimage/map');


RootNamespace.LinkData = require('@trailimage/json-ld');

/**
 * Add static Factory() method to LinkData namespace
 */
Object.defineProperty(RootNamespace.LinkData, 'Factory', {
	get: function Factory() { return require('./json-ld.js'); }
});

/**
 * @returns {AuthNamespace}
 * @constructor
 */
RootNamespace.Auth = require('./auth');

/**
 * @returns TI.Factory
 * @constructor
 */
RootNamespace.Factory = require('./models');

/**
 * @type TI.Middleware
 * @constructor
 */
RootNamespace.Middleware = require('./middleware');

/**
 * @returns {ControllerNamespace}
 * @constructor
 */
RootNamespace.Controller = require('./controllers');

/**
 * @returns TI.Photo
 * @constructor
 */
RootNamespace.Photo = require('./models/photo.js');

/**
 * @type TI.PhotoSize
 * @constructor
 */
RootNamespace.PhotoSize = require('./models/photo-size.js');

/**
 * @constructor
 */
RootNamespace.PostTag = require('./models/post-tag.js');

/**
 * @returns TI.Video
 * @constructor
 */
RootNamespace.Video = require('./models/video.js');


module.exports = RootNamespace;