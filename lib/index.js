'use strict';

const Core = require('@trailimage/blog-core');

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * Modules without dependencies can be initialized immediately
 * @namespace
 * @alias Blog
 */
class BlogNamespace {
	static get config() { return require('./config.js'); }
	static get LinkData() { return require('@trailimage/json-ld-factory'); }
}

BlogNamespace.is = Core.is;
BlogNamespace.re = Core.re;
BlogNamespace.format = Core.format;
BlogNamespace.active = Core.active;
/** @alias Blog.enum */
//BlogNamespace.enum = require('@trailimage/enum');
/** @alias Blog.icon */
BlogNamespace.icon = Core.enum.icon;
BlogNamespace.httpStatus = Core.enum.httpStatus;
BlogNamespace.mimeType = Core.enum.mimeType;
BlogNamespace.template = require('./template.js');
//BlogNamespace.PDF = require('@trailimage/pdf');
BlogNamespace.Map = require('@trailimage/map');

BlogNamespace.Cache = Core.Cache;
//BlogNamespace.Auth = Core.Auth;

/**
 * @returns {ControllerNamespace}
 * @constructor
 */
BlogNamespace.Controller = require('./controllers');

//BlogNamespace.Photo = Core.Photo;
//BlogNamespace.PhotoSize = Core.PhotoSize;
//BlogNamespace.PostTag = Core.PostTag;
//BlogNamespace.Video = Core.Video;
//BlogNamespace.EXIF = Core.EXIF;
BlogNamespace.Library = Core.Library;
BlogNamespace.Post = Core.Post;

module.exports = BlogNamespace;