'use strict';

const is = require('../is.js');
const format = require('../format.js');

class Post {
	constructor() {
		this.id = null;
		/** @type {String} */
		this.originalTitle = null;
		/** @type {String} */
		this.dateTaken = null;
		/** @type {Video} */
		this.video = null;
		/** @type {Photo[]} */
		this.photos = [];
		/**
		 * The slug shared by posts in a series
		 * @type {String}
		 **/
		this.seriesSlug = null;
		/**
		 * Unique slug for one post in a series
		 * @type {String}
		 **/
		this.partSlug = null;
		/**
		 * Part of title after colon for posts that are part of a series
		 * @type {String}
		 */
		this.subTitle = null;
		/** @type {String} */
		this.title = null;
		/**
		 * Flickr collection names are applied as set tags
		 * @type {String[]}
		 **/
		this.tags = [];
		/** @type {String} */
		this.photoTagList = null;
		/** @type {String} Mode of transport for icon display in menu */
		this.mode = null;
		/** @type {String} */
		this.photoCoordinates = null;

		// fields added by call to addInfo()

		/** @type {Boolean} */
		this.infoLoaded = false;
		/**
		 * Photos are lazy loaded
		 * @type {Boolean}
		 */
		this.photosLoaded = false;
		/** @type {String} */
		this.description = null;
		/** @type {String} */
		this.longDescription = null;
		/** @type {Date} */
		this.createdOn = null;
		/** @type {Date} */
		this.updatedOn = null;
		/** @type {Number} */
		this.photoCount = 0;
		/** @type {String} */
		this.bigThumb = null;
		this.smallThumb = null;
		/** @type {Flickr.PhotoSummary[]} */
		this.thumb = null;
		/**
		 * Whether post pictures occurred at a specific point in time
		 * Exceptions are themed sets
		 * @type {boolean}
		 */
		this.chronological = true;
		/** @type {String} */
		this.slug = null;
		/** @type {Post} */
		this.next = null;
		/** @type {Post} */
		this.previous = null;
		/** @type {int} */
		this.part = 0;
		/**
		 * Whether post is part of a series
		 * @type {Boolean}
		 */
		this.isPartial = false;
		/**
		 * Whether next post is part of the same series
		 * @type {Boolean}
		 */
		this.nextIsPart = false;
		/**
		 * Whether previous post is part of the same series
		 * @type {Boolean}
		 */
		this.previousIsPart = false;
		/**
		 * Total number of posts in series, if any
		 * @type {Number}
		 */
		this.totalParts = 0;
		/**
		 * Whether this post begins a series
		 * @type {boolean}
		 */
		this.isSeriesStart = false;
	}

	/**
	 * Whether post has tags
	 * @returns {boolean}
	 */
	get hasTags() { return this.tags.length > 0; }

	/**
	 * Title and optional subtitle
	 * @returns {string}
	 */
	name() {
		// context is screwed up when called from HBS template
		var p = (this instanceof Post) ? this : this.post;
		return p.title + ((p.isPartial) ? ': ' + p.subTitle : '');
		//return this.title + ((this.isPartial) ? ': ' + this.subTitle : '');
	};

	/**
	 * Remove post details to force reload from data provider
	 */
	removeDetails() {
		// from addInfo()
		this.video = null;
		this.createdOn = null;
		this.updatedOn = null;
		this.photoCount = 0;
		this.description = null;
		this.thumb = null;
		this.bigThumb = null;
		this.smallThumb = null;
		this.infoLoaded = false;

		// from getPhotos()
		this.photos = null;
		this.photoTagList = null;
		this.photoCoordinates = null;
		this.longDescription = null;
		this.photosLoaded = false;
	};

	makeSeriesStart() {
		this.isSeriesStart = true;
		this.slug = this.seriesSlug;
	};

	/**
	 * For post titles that looked like part of a series (colon separator) but had no other parts
	 */
	ungroup() {
		this.title = this.originalTitle;
		this.subTitle = null;
		this.slug = format.slug(this.originalTitle);
		this.isSeriesStart = false;
		this.isPartial = false;
		this.nextIsPart = false;
		this.previousIsPart = false;

		this.seriesSlug = null;
		this.partSlug = null;
	};

	/**
	 * Whether item matches slug
	 * @param {String} slug
	 * @returns {boolean}
	 */
	isMatch(slug) {
		return (this.slug == slug || (is.value(this.partSlug) && slug == this.seriesSlug + '-' + this.partSlug));
	}

	/**
	 * Groups the items belong to are treated as tags or keywords
	 * @param {String} t
	 */
	addTag(t) {
		if (this.tags.indexOf(t) == -1) {
			this.tags.push(t);

			for (let i in moveMode) {
				let re = moveMode[i];
				if (re.test(t)) {
					this.mode = i;
					re.lastIndex = 0;
					break;
				}
			}
			if (this.mode === null) { this.mode = 'motorcycle'; }
		}
	};
}

module.exports = Post;

// - Private static members ---------------------------------------------------

/**
 * Set mode of transportation icon based on post tag (Flickr set collection)
 * @enum {RegExp}
 */
const moveMode = {
	motorcycle: /(KTM|BMW|Honda)/gi,
	bicycle: /bicycle/gi,
	hike: /hike/gi,
	jeep: /jeep/gi
};