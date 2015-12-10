'use strict';

const TI = require('../');
const is = TI.is;
const db = TI.active;
const config = TI.config;
const OAuthBase = TI.Auth.Base;

/**
 * Methods for interacting with photo source
 * @extends {OAuthBase}
 */
class PhotoBase extends OAuthBase {
	/**
	 * @param {FactoryBase} factory
	 */
	constructor(factory) {
		super();

		this.options = {};
		this.needsAuth = false;
		/**
		 * @type {FactoryBase}
		 */
		this.factory = factory;
		/**
		 * Methods for managing model cache
		 */
		this.cache = TI.Provider.Cache.Model;
	}

	/**
	 * Retrieve EXIF data for a photo
	 * @param {String} photoID
	 * @param {function(EXIF)} callback
	 */
	loadExif(photoID, callback) {}

	/**
	 * Provider "set" or "album" is treated as a post
	 * If provided a post instance, it is checked for photo and information completeness
	 * and updated as needed
	 * @param {String|Post} postOrID
	 * @param {function(Post)} callback
	 */
	loadPost(postOrID, callback) {};

	/**
	 * @param {Post} post
	 * @param {function(Post)} callback
	 */
	loadPostInfo(post, callback) {};

	/**
	 * @param {Post} post
	 * @param {function(Post)} callback
	 */
	loadPostPhotos(post, callback) {};

	/**
	 * Retrieve posts, post tags and photo tags from cache (categories)
	 * @param {function(Library)} callback
	 */
	loadLibrary(callback) {
		this.loadPhotoTags(photoTags => {
			// post parsing depends on having the photo tags
			this.cache.getPosts((data, tree) => {
				if (tree !== null) {
					try {
						let library = this.factory.buildLibrary(tree);
						this._loadAllCachedPosts(library, data);
						library.photoTags = photoTags;
						callback(library);
					} catch (error) {
						db.log.error('Unable to parse cached library (%s): must reload', error.toString());
						this._loadLibraryFromSource(callback, photoTags);
					}
				} else {
					// remove bad cache data
					//this.cache.clear();
					this._loadLibraryFromSource(callback, photoTags);
				}
			});
		});
	}

	/**
	 * Reload library from source
	 * @param {function(string[])} [callback] List of affected tag slugs that should be invalidated if cached
	 */
	reloadLibrary(callback) {
		let library = TI.Library.current;
		// track tag slugs that need to be refreshed if cached
		let tagSlugs = [];
		// record post slugs so they can be compared to the new list
		let postSlugs = library.posts.map(p => p.slug);

		this.reloadPhotoTags(photoTags => {
			this._loadLibraryFromSource(library => {
				// returned library instance should be same as above
				library.posts.filter(p => postSlugs.indexOf(p.slug) == -1).forEach(p => {
					// iterate over every post with a slug not present in postSlugs
					db.log.info('Found new post "%s"', p.title);
					// all tags applied to the new post will need to be refreshed
					tagSlugs = tagSlugs.concat(p.tagSlugs(p.tags));
					// update adjecent posts to correct next/previous links
					if (p.next !== null) { tagSlugs.push(p.next.slug); }
					if (p.previous !== null) { tagSlugs.push(p.previous.slug); }
				});
				if (is.callable(callback)) { callback(tagSlugs); }
			}, photoTags);
		});
	}

	/**
	 * Asynchronously load details for all posts in library
	 * @param {Library} library
	 */
	loadAllPosts(library) {
		let pending = library.posts.length;

		for (let p of library.posts) {
			// begin an async call for each post
			this.loadPostInfo(p, post => {
				if (post === null) {
					// if no post info was found then assume post doesn't belong in library
					db.log.warn('Removing post %s from library', p.id);
					this.cache.dequeue(p.id);
				}
				if (--pending <= 0) {
					library.postInfoLoaded = true;
					// write raw provider data to cache
					this.cache.flush();
					db.log.info('Finished loading library posts');
				}
			});
		}
	}

	/**
	 * Parse cached post data
	 * @param {Library} library
	 * @param {Object} cacheData
	 * @private
	 */
	_loadAllCachedPosts(library, cacheData) {
		for (let p of library.posts) {
			// TODO: handle empty data
			this.factory.buildPostInfo(p, cacheData[p.id]);
		}
		library.postInfoLoaded = true;
		db.log.info('Finished loading library posts');
	}

	/**
	 * Load library from source provider
	 * @param {function(Library)} callback
	 * @param {Object.<String>} [photoTags] Photo tags with slug and full name
	 * @private
	 */
	_loadLibraryFromSource(callback, photoTags) {}

	/**
	 * Retrieve first (could be more than one) post ID that photo belongs to
	 * @param {String} photoID
	 * @param {function(String)} callback PostID
	 */
	loadPhotoPostID(photoID, callback) {}

	/**
	 * Load photo tags from cache or source
	 * @param {function(Object.<String>)} callback
	 */
	loadPhotoTags(callback) {
		this.cache.getPhotoTags(tags => {
			if (tags !== null) {
				db.log.info('Photo tags loaded from cache');
				callback(tags)
			} else {
				this._loadPhotoTagsFromSource(rawTags => {
					let tags = this.factory.buildPhotoTags(rawTags, this.options.excludeTags);
					this.cache.addPhotoTags(tags);
					callback(tags);
				});
			}
		});
	}

	/**
	 * Reload photo tags from cache or source
	 * @param {function(Object.<String>)} callback
	 */
	reloadPhotoTags(callback) {
		this.cache.removePhotoTags(done => { this.loadPhotoTags(callback); });
	}

	/**
	 * Load photo tags from source provider
	 * @param {function(Object.<String>)} callback
	 * @private
	 */
	_loadPhotoTagsFromSource(callback) {}

	/**
	 * @param {String} photoID
	 * @param {function(PhotoSize[])} callback
	 */
	loadPhotoSizes(photoID, callback) {}

	/**
	 *
	 * @param {String[]|String} tags
	 * @param {function(Photo[])} callback
	 */
	loadPhotosWithTags(tags, callback) {}
}

module.exports = PhotoBase;