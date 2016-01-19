'use strict';

/** @type ProviderManager */
let _provider = null;
const Core = require('@trailimage/blog-core');

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * Modules without dependencies can be initialized immediately
 * @namespace
 * @alias Blog
 */
class BlogNamespace {
	static get config() { return require('./config.js'); }
	static get log() { return BlogNamespace.active.log; }
	static get cache() { return BlogNamespace.active.cache; }

	/**
	 * Dependency injected providers
	 * @type ProviderManager
	 */
	static get active() {
		if (_provider === null) {	_provider = new Core.Provider.Manager(); }
		return _provider;
	}
}

BlogNamespace = Core.is;
BlogNamespace.re = Core.re;
BlogNamespace.format = Core.format;
/** @alias Blog.enum */
BlogNamespace.enum = require('@trailimage/enum');
/** @alias Blog.icon */
BlogNamespace.icon = BlogNamespace.enum.icon;
BlogNamespace.httpStatus = BlogNamespace.enum.httpStatus;
BlogNamespace.mimeType = BlogNamespace.enum.mimeType;
BlogNamespace.template = require('./template.js');
BlogNamespace.PDF = require('@trailimage/pdf');
BlogNamespace.Provider = require('./providers');
BlogNamespace.Map = require('@trailimage/map');
BlogNamespace.LinkData = require('@trailimage/json-ld-factory');

/**
 * Add static Factory() method to LinkData namespace
 */
Object.defineProperty(BlogNamespace.LinkData, 'Factory', {
	get: function Factory() { return require('./factories/json-ld.js'); }
});


BlogNamespace.Auth = require(Core.Auth);
BlogNamespace.Factory = require('./models');

/**
 * @type Blog.Middleware
 * @constructor
 */
BlogNamespace.Middleware = require('./middleware');

/**
 * @returns {ControllerNamespace}
 * @constructor
 */
BlogNamespace.Controller = require('./controllers');


BlogNamespace.Photo = Core.Photo;
BlogNamespace.PhotoSize = Core.PhotoSize;
BlogNamespace.PostTag = Core.PostTag;
BlogNamespace.Video = Core.Video;
BlogNamespace.EXIF = Core.EXIF;
BlogNamespace.Library = Core.Library;
BlogNamespace.Post = Core.Post;

module.exports = BlogNamespace;