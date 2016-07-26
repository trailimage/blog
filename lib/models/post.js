'use strict';

const TI = require('../');
const is = TI.is;
const db = TI.active;
const format = TI.format;

/**
 * @alias TI.Post
 */
class Post {
	constructor() {
		this.id = null;
		/** @type String */
		this.originalTitle = null;
		/** @type Date */
		this.dateTaken = null;
		/** @type String */
		this.author = Post.defaultAuthor;
		/** @type TI.Video */
		this.video = null;
		/**
		 * @type TI.Photo[]
		 */
		this.photos = [];
		/**
		 * The slug shared by posts in a series
		 * @type String
		 **/
		this.seriesSlug = null;
		/**
		 * Unique slug for one post in a series
		 * @type String
		 **/
		this.partSlug = null;
		/**
		 * Part of title after colon for posts that are part of a series
		 * @type String
		 */
		this.subTitle = null;
		/** @type String */
		this.title = null;
		/**
		 * PostTag titles keyed to slug
		 * @type Object.<String,String>
		 */

		/** @type String */
		this.photoTagList = null;
		/**
		 * Serialized photo coordinates used to generate static map
		 * @type String
		 * @see https://developers.google.com/maps/documentation/static-maps/intro
		 * @private
		 */
		this.photoCoordinates = null;

		// fields added by call to addInfo()



		/** @type String */
		this.description = null;
		/**
		 * Description including photo and video counts
		 * @type String
		 */
		this.longDescription = null;
		/** @type Date */
		this.createdOn = null;
		/** @type Date */
		this.updatedOn = null;
		/** @type Number */
		this.photoCount = 0;
		/**
		 * URL of large thumbnail
		 * @type String
		 */
		this.bigThumbURL = null;
		/**
		 * URL of small thumbnail
		 * @type String
		 */
		this.smallThumbURL = null;
		/** @type TI.Photo */
		this.coverPhoto = null;


		/** @type String */
		this.slug = null;

	}


	/**
	 * Whether item matches slug
	 * @param {String} slug
	 * @returns {Boolean}
	 */
	isMatch(slug) {
		return (this.slug == slug || (is.value(this.partSlug) && slug == this.seriesSlug + '-' + this.partSlug));
	}

}

/**
 * Override to change styling
 * @type String
 */
Post.subtitleSeparator = ':';
Post.defaultAuthor = null;

module.exports = Post;

// - Private static members ---------------------------------------------------

