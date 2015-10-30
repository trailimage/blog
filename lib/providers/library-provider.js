'use strict';

const is = require('./../is.js');
const log = require('./../log.js');
const setting = require('./../settings.js');
const Library = require('../models/library.js');
const events = require('events');
const cache = require('../cache.js');
/**
 * The parent key under which all library objects are cached
 * @type {string}
 */
const cacheKey = 'model:library';
const rootKey = 'root';
/**
 * Queue library source data for caching while it's being lazy-loaded
 * @type {Object.<Object>}
 */
const cacheQueue = {};

/**
 * Library of all photos and posts
 * @extends {EventEmitter}
 */
class LibraryProvider extends events.EventEmitter {
	constructor() {
		/**
		 * Provider-specific codes used to retrieve photo size metadata
		 */
		this.sizeCode = {
			thumb: null,
			preview: null,
			fallbacks: [],
			normal: null,
			big: null
		};
	}

	/**
	 * Retrieve EXIF data for a photo
	 * @param {String} photoID
	 * @param {function(EXIF)} callback
	 */
	exif(photoID, callback) {}

	/**
	 *
	 * @param {String|Post} postOrID
	 * @param {function(Post)} callback
	 */
	getPost(postOrID, callback) {};

	/**
	 * @param {Post|String} postOrID
	 * @param {function(Post)} callback
	 */
	updatePostFields(postOrID, callback) {};

	/**
	 * Retrieve posts and post tags from cache (categories)
	 * @param {function(Library)} callback
	 */
	load(callback) {
		if (setting.cacheOutput) {
			cache.getAll(cacheKey, data => {
				if (data != null) {
					try {
						let library = Library.parse(JSON.parse(data[rootKey]));
						this._addCachedPosts(library, data);
						callback(library);
					} catch (error) {
						log.error('Unable to parse cached library (%s): must reload', error.toString());
						this._loadFromSource(callback);
					}
				} else {
					this._loadFromSource(callback);
				}
			});
		} else {
			this._loadFromSource(callback);
		}
	}

	/**
	 * @param {function(Library)} callback
	 */
	_loadFromSource(callback) {}

	/**
	 * Retrieve first (could be more than one) post that photo belongs to
	 * @param {String} photoID
	 * @param {function(Post)} callback
	 */
	photoPostID(photoID, callback) {}

	/**
	 * All photo tags in library
	 * @param {function(Object)} callback
	 */
	photoTags(callback) {}

	/**
	 * @param {String} photoID
	 * @param {function(Size[])} callback
	 */
	photoSizes(photoID, callback) {}

	/**
	 *
	 * @param {String[]} tags
	 * @param {function(Photo[])} callback
	 */
	photosWithTags(tags, callback) {}

	/**
	 * Add item to pending cache
	 * @param {String} postID
	 * @param {Object|String} value
	 * @private
	 */
	_enqueuePost(postID, value) {
		cacheQueue[postID] = JSON.stringify(value);
	}

	/**
	 * Asynchronously load additional post information
	 * Library is a singleton
	 * @param {Library} library
	 * @param {Object} data
	 */
	_addCachedPosts(library, data) {
		let pending = library.posts.length;

		for (let p of library.posts) {
			// TODO: handle empty data
			this._parsePostFields(p, data[p.id]);
		}
		library.postInfoLoaded = true;
		log.info('Finished loading library posts');
	}

	/**
	 * Provider-specific field parsing
	 * @param {Post} post
	 * @param {Object} fields
	 * @private
	 */
	_parsePostFields(post, fields) {}

	/**
	 * Asynchronously load details for all posts in library
	 * Library is a singleton
	 * @param {Library} library
	 */
	_addPosts(library) {
		let pending = library.posts.length;

		for (let p of library.posts) {
			// begin an async call for each post
			this.updatePostFields(p, post => {
				if (post === null) {
					// if no post info was found then assume post doesn't belong in library
					log.warn('Removing post %s from library', p.id);
					dequeue(p.id);
				}
				if (--pending <= 0) {
					library.postInfoLoaded = true;
					// write raw provider data to cache
					flushCache();
					log.info('Finished loading library posts');
				}
			});
		}
	}
}

/**
 * @param {String} name
 * @private
 */
function dequeue(name) { delete cacheQueue[name]; }

/**
 * Write cache
 * @private
 */
function flushCache() {	cache.addAll(cacheKey, cacheQueue); }

module.exports = LibraryProvider;