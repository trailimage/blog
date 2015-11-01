'use strict';

const is = require('../is.js');
const config = require('../config.js');
const log = config.provider.log;
const Library = require('../models/library.js');

/**
 * Methods for interacting with library of photos and posts
 */
class LibraryProvider {
	constructor() {
		/**
		 * Provider-specific object field names that store photos sizes
		 */
		this.sizeField = {
			thumb: null,
			preview: null,
			fallbacks: [],
			normal: null,
			big: null
		};
		/**
		 * Methods for managing library cache
		 */
		this.cache = require('./library-cache.js');
	}

	/**
	 * @returns {Array.<String>}
	 */
	get sizesForPost() {
		return [this.sizeField.preview, this.sizeField.normal, this.sizeField.big].concat(this.sizeField.fallbacks);
	}

	/**
	 * @returns {Array.<String>}
	 */
	get sizesForSearch() {
		return [this.sizeField.thumb];
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
	 * @param {Post} post
	 * @param {function(Post)} callback
	 */
	updatePostInfo(post, callback) {};

	/**
	 * @param {Post} post
	 * @param {function(Post)} callback
	 */
	updatePostPhotos(post, callback) {};

	/**
	 * Retrieve posts and post tags from cache (categories)
	 * @param {function(Library)} callback
	 */
	load(callback) {
		if (config.cacheOutput) {
			this.cache.load((data, tree) => {
				if (tree !== null) {
					try {
						let library = Library.parse(tree);
						this._addCachedPosts(library, data);
						callback(library);
					} catch (error) {
						log.error('Unable to parse cached library (%s): must reload', error.toString());
						this._loadFromSource(callback);
					}
				} else {
					// remove bad cache data
					//this.cache.clear();
					this._loadFromSource(callback);
				}
			});
		} else {
			this._loadFromSource(callback);
		}
	}

	/**
	 * Load library from source provider
	 * @param {function(Library)} callback
	 * @private
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
	 * Asynchronously load additional post information
	 * Library is a singleton
	 * @param {Library} library
	 * @param {Object} data
	 * @private
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
	 * Provider-specific photo parsing
	 * @param {Post} post
	 * @param {Object} photos
	 * @private
	 */
	_parsePostPhotos(post, photos) {}

	/**
	 * Asynchronously load details for all posts in library
	 * Library is a singleton
	 * @param {Library} library
	 * @private
	 */
	_addPosts(library) {
		let pending = library.posts.length;

		for (let p of library.posts) {
			// begin an async call for each post
			this.updatePostInfo(p, post => {
				if (post === null) {
					// if no post info was found then assume post doesn't belong in library
					log.warn('Removing post %s from library', p.id);
					this.cache.dequeue(p.id);
				}
				if (--pending <= 0) {
					library.postInfoLoaded = true;
					// write raw provider data to cache
					this.cache.flush();
					log.info('Finished loading library posts');
				}
			});
		}
	}
}

module.exports = LibraryProvider;