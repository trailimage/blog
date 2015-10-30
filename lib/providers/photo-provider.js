'use strict';

const is = require('./../is.js');
const log = require('./../log.js');
const events = require('events');

/**
 * @extends {EventEmitter}
 */
class PhotoProvider extends events.EventEmitter {
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
	addPostInfo(post, callback) {};

	/**
	 * Retrieve posts and post tags (categories)
	 * @param {function(Library)} callback
	 */
	library(callback) {}

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
}

module.exports = PhotoProvider;