'use strict';

const TI = require('../');
const is = TI.is;
const db = TI.active;
const OAuthBase = TI.Auth.Base;

/**
 * Methods for interacting with photo source
 * @extends TI.Auth.Base
 */
class PhotoProviderBase extends OAuthBase {
	/**
	 * @param {TI.Factory.Base} factory
	 */
	constructor(factory) {
		super();

		this.options = {};
		this.needsAuth = false;
		/**
		 * @type TI.Factory.Base
		 */
		this.factory = factory;
		/**
		 * Methods for managing model cache
		 * @alias TI.Provider.Photo.Base.cache
		 * @type TI.Provider.Cache.Model
		 */
		this.cache = TI.Provider.Cache.Model;
	}

	/**
	 * Retrieve EXIF data for a photo
	 * @param {String} photoID
	 * @param {function(TI.EXIF)} callback
	 */
	loadExif(photoID, callback) {}

	/**
	 * Provider "set" or "album" is treated as a post
	 * If provided a post instance, it is checked for photo and information completeness
	 * and updated as needed
	 * @alias TI.Provider.Photo.Base.loadPost
	 * @param {String|TI.Post} postOrID
	 * @param {function(TI.Post)} callback
	 */
	loadPost(postOrID, callback) {};

	/**
	 * @param {TI.Post} post
	 * @param {function(TI.Post)} callback
	 */
	loadPostInfo(post, callback) {};

	/**
	 * @param {TI.Post} post
	 * @param {function(TI.Post)} callback
	 */
	loadPostPhotos(post, callback) {};




	/**
	 * Load library from source provider
	 * @param {function(TI.Library)} callback
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
	 * Reload photo tags from source
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
	 * @param {function(TI.PhotoSize[])} callback
	 */
	loadPhotoSizes(photoID, callback) {}

	/**
	 * Array of tagged photos
	 * @param {String[]|String} tags
	 * @param {function(TI.Photo[])} callback
	 */
	loadPhotosWithTags(tags, callback) {}
}

module.exports = PhotoProviderBase;