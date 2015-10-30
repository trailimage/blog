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
	post(postOrID, callback) {};

	postInfo(postID, callback) {};

	/**
	 * Retrieve posts and post tags (categories)
	 * @param {function(Library)} callback
	 */
	library(callback) {}

	/**
	 * Retrieve post that photo belongs to
	 * @param {String} photoID
	 * @param {function(Post)} callback
	 */
	postForPhoto(photoID, callback) {}

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