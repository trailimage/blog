'use strict';

let FlickrOptions = {};
/**
 * @param {Flickr.Response} r
 */
FlickrOptions.prototype.value = function(r) {};
/** @type {Boolean} */
FlickrOptions.prototype.sign = false;
/** @type {Boolean} */
FlickrOptions.prototype.allowCache = false;
/** @type {String} */
FlickrOptions.prototype.error = null;
/** @type {Object} */
FlickrOptions.prototype.args = {};

//region Middleware

let ViewCacheItem = {};
/** @type {Buffer} */
ViewCacheItem.prototype.buffer = null;
/** @type {String} */
ViewCacheItem.prototype.eTag = null;

/**
 * @mixes {Express.Request}
 * @mixes {Request}
 */
let BlogRequest = {};
/** @returns {String} */
BlogRequest.prototype.clientIP = function() {};

/**
 * @mixes {Express.Response}
 * @mixes {Response}
 * @mixes {Event.EventEmitter}
 */
let BlogResponse = {};
BlogResponse.prototype.notFound = function() {};
BlogResponse.prototype.internalError = function() {};
/**
 * @param {String} slug
 * @param {String|function(function)|Object} p2
 * @param {function(function)} [p3]
 */
BlogResponse.prototype.sendView = function(slug, p2, p3) {};
/**
 * @param {String} slug
 * @param {function} render
 */
BlogResponse.prototype.sendJson = function(slug, render) {};
/**
 * @returns {Promise}
 */
BlogResponse.prototype.getCacheKeys = function() {};
/**
 * @param {String[]|String} slugs
 * @returns {Promise}
 */
BlogResponse.prototype.removeFromCache = function(slugs) {};
/**
 * @param {String} mimeType
 * @param {Object} item
 * @param {Boolean} [cache = true]
 */
BlogResponse.prototype.sendCompressed = function(mimeType, item, cache) {};
/** @type {Object} */
BlogResponse.prototype.redirected = {};
/**
 * @param {String|Object} message
 */
BlogResponse.prototype.jsonError = function(message) {};
/**
 * @param {String} message
 */
BlogResponse.prototype.jsonMessage = function(message) {};

//endregion
//region Mocks

/** @mixes BlogRequest */
let MockRequest = {};
MockRequest.prototype.reset = function() {};
/** @type {Object} */
MockRequest.prototype.connection = {};

/** @mixes BlogResponse */
let MockResponse = {};
MockResponse.prototype.reset = function() {};
/** @type {Buffer|String} */
MockResponse.prototype.content = null;
/** @type {Object} */
MockResponse.prototype.rendered = null;
/** @type {Boolean} */
MockResponse.prototype.ended = false;
/** @type {Boolean} */
MockResponse.prototype.endOnRender = false;

//endregion
//region Models

let Category = {};
/** @type {String} */
Category.prototype.title = null;
/** @type {String} */
Category.prototype.key = null;
/** @type {Category[]} */
Category.prototype.subcategories = [];
/** @type {Post[]} */
Category.prototype.posts = [];
/** @type {Boolean} */
Category.prototype.isChild = false;
/** @type {Boolean} */
Category.prototype.isParent = false;
/**
 * @param {Category} subcat
 */
Category.prototype.add = function(subcat) {};
/**
 * @param {String} key
 * @returns {Category}
 */
Category.prototype.subcategory = function(key) {};
Category.prototype.has = function() {};
/**
 * @param {Post} post
 * @returns {Category}
 */
Category.prototype.removePost = function(post) {};


let EXIF = {};
/** @type {String} */
EXIF.prototype.artist = null;
/** @type {Number} */
EXIF.prototype.compensation = 0;
/** @type {Number} */
EXIF.prototype.time = 0;
/** @type {Number} */
EXIF.prototype.fNumber = 0;
/** @type {Number} */
EXIF.prototype.focalLength = 0;
/** @type {Number} */
EXIF.prototype.ISO = 0;
/** @type {String} */
EXIF.prototype.lens = null;
/** @type {String} */
EXIF.prototype.model = null;
/** @type {String} */
EXIF.prototype.software = null;
/** @type {Boolean} */
EXIF.prototype.sanitized = false;


let Size = {};
/** @type {String} */
Size.prototype.url = null;
/** @type {Number} */
Size.prototype.width = 0;
/** @type {Number} */
Size.prototype.height = 0;
/** @type {Boolean} */
Size.prototype.isEmpty = false;


let Photo = {};
/** @type {String} */
Photo.prototype.id = null;
/** @type {Nunber} */
Photo.prototype.index = 0;
/** @type {String} */
Photo.prototype.sourceUrl = null;
/** @type {String} */
Photo.prototype.title = null;
/** @type {String} */
Photo.prototype.description = null;
/** @type {String[]} */
Photo.prototype.tags = [];
/** @type {Date} */
Photo.prototype.dateTaken = null;
/** @type {Number} */
Photo.prototype.latitude = 0.0;
/** @type {Number} */
Photo.prototype.longitude = 0.0;
/** @type {Boolean} */
Photo.prototype.primary = false;
/** @type {Object.<Size>} */
Photo.prototype.size = {};
/** @type {Size} */
Photo.size.prototype.preview = null;
/** @type {Size} */
Photo.size.prototype.normal = null;
/** @type {Size} */
Photo.size.prototype.big = null;
/** @returns {Promise} */
Photo.prototype.getEXIF = function() {};


let Post = {};
/** @type {String} */
Post.prototype.id = null;
/** @type {String} */
Post.prototype.key = null;
/** @type {String} */
Post.prototype.seriesKey = null;
/** @type {String} */
Post.prototype.partKey = null;
/** @type {Boolean} */
Post.prototype.chronological = true;
/** @type {String} */
Post.prototype.originalTitle = null;
/** @type {Boolean} */
Post.prototype.photosLoaded = false;
/** @type {Photo[]} */
Post.prototype.photos = [];
/** @type {Number} */
Post.prototype.photoCount = 0;
/** @type {Photo} */
Post.prototype.coverPhoto = null;
/** @type {Boolean} */
Post.prototype.feature = false;
/** @type {Object.<Category>} */
Post.prototype.categories = {};
/** @type {Boolean} */
Post.prototype.hasCategories = true;
/** @type {Boolean} */
Post.prototype.infoLoaded = false;
/** @type {Boolean} */
Post.prototype.triedTrack = false;
/** @type {Boolean} */
Post.prototype.hasTrack = null;
/** @type {Post} */
Post.prototype.next = null;
/** @type {Post} */
Post.prototype.previous = null
/** @type {Number} */
Post.prototype.part = 0;
/** @type {Boolean} */
Post.prototype.isPartial = false;
/** @type {Boolean} */
Post.prototype.nextIsPart = false;
/** @type {Boolean} */
Post.prototype.previousIsPart = false;
/** @type {Number} */
Post.prototype.totalParts = 0;
/** @type {Boolean} */
Post.prototype.isSeriesStart = false;
/** @type {String} */
Post.prototype.photoCoordinates = null;

Post.prototype.makeSeriesStart = function() {};
Post.prototype.ungroup = function() {};
Post.prototype.empty = function() {};
/** @returns {String} */
Post.prototype.name = function() {};
/** @returns {Promise} */
Post.prototype.getInfo = function() {};
/** @returns {Promise} */
Post.prototype.getPhotos = function() {};

/**
 * @param {String} key
 * @returns {Boolean}
 */
Post.prototype.hasKey = function(key) {};
/**
 * @param {String} id
 * @returns {Boolean}
 */
Post.prototype.hasPhotoID = function(id) {};
Post.prototype.serializePhotoCoordinates = function() {};


let Library = {};
/** @type {Object.<Category>} */
Library.prototype.categories = {};
/** @type {Post[]} */
Library.prototype.posts = [];
/** @type {Object.<String>} */
Library.prototype.tags = {};
/** @type {Boolean} */
Library.prototype.loaded = false;
/** @type {Boolean} */
Library.prototype.postInfoLoaded = false;

Library.prototype.empty = function() {};

//endregion