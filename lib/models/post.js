'use strict';

const is = require('../is.js');
const format = require('../format.js');
const config = require('../config.js');

class Post {
	constructor() {
		this.id = null;
		/** @type {String} */
		this.originalTitle = null;
		/** @type {String} */
		this.dateTaken = null;
		/**
		 * Standard deviation for photo dates
		 * @type {number}
		 */
		this.standardDateDeviation = 0;
		/** @type {Video} */
		this.video = null;
		/**
		 * @type {Photo[]}
		 * @private
		 */
		this._photos = [];
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
		/**
		 * Serialized photo coordinates used to generate static map
		 * @type {String}
		 * @see https://developers.google.com/maps/documentation/static-maps/intro
		 * @private
		 */
		this._photoCoordinates = null;

		/**
		 * @type {Boolean}
 		 */
		this._photoCoordinatesParsed = false;

		// fields added by call to addInfo()

		/** @type {Boolean} */
		this.infoLoaded = false;
		/**
		 * Photos are lazy loaded
		 * @type {Boolean}
		 */
		this.photosLoaded = false;
		/**
		 * Whether an attempt has been made to load GPS track
		 * @type {Boolean}
		 */
		this.triedTrack = false;
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
	 * @returns {Photo[]}
	 */
	get photos() { return this._photos; }

	/**
	 * Build coordinate property used by Google's static maps
	 * @return {String} Comma delimited list of coordinates
	 * @see https://developers.google.com/maps/documentation/static-maps/intro
	 */
	get photoCoordinates() {
		if (!this._photoCoordinatesParsed) {
			let start = 1;  // always skip first photo
			let total = this._photos.length;
			let map = '';

			if (total > config.google.maxMarkers) {
				start = 5;  // skip the first few which are often just prep shots
				total = config.google.maxMarkers + 5;
				if (total > this._photos.length) { total = this._photos.length; }
			}

			for (let i = start; i < total; i++) {
				let p = photos[i];
				if (p.latitude > 0) { map += '|' + p.latitude + ',' + p.longitude; }
			}

			this._photoCoordinates = (is.empty(map)) ? null : encodeURIComponent('size:tiny' + map);
			this._photoCoordinatesParsed = true;
		}
		return this._photoCoordinates;
	}

	/**
	 * @param {Photo[]} list
	 */
	set photos(list) {
		this._photos = list;
		this._updatePhotoDateDeviation();
		this.thumb = this._photos.find(p => p.primary);

		if (this._photos.length > 0) {
			// this will also update photo tag slugs to full names
			let library = require('./library.js').current;
			this.photoTagList = library.photoTagList(this._photos);
		}
	}

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
		this._photoCoordinates = null;
		this._photoCoordinatesParsed = false;
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

	/**
	 * Overall date for a set of photos
	 * Could sort and average
	 */
	summarize() {
		/** @type {int} */
		let firstDatedPhoto = 2;    // use third photo in case the first few are generated map images
		let photoCount = this._photos.length;


		if (photoCount <= firstDatedPhoto) { firstDatedPhoto = photoCount - 1; }
		this.dateTaken = format.date(this._photos[firstDatedPhoto].dateTaken);

		if (!is.empty(this.description)) {
			this.description = `${this.description} (Includes ${photoCount} photos`;
			this.description += is.value(this.video) ? ' and one video)' : ')';
		}
	}

	/**
	 * Calculate photo date deviations to recognize those that are likely screenshot or historical imagery
	 * @private
	 */
	_updatePhotoDateDeviation() {
		let total = 0;
		let count = this._photos.length;
		for (let p of this._photos) { total += p.dateTaken.getTime(); }
		let mean = total / count;
		// average deviations
		for (let p of this._photos) { total += Math.pow(p.dateTaken.getTime() - mean, 2); }
		// standard deviation
		this.standardDateDeviation = Math.sqrt(total / count);

		for (let p of this._photos) {
			p.dateDeviation = Math.abs((p.dateTaken.getTime() - mean) / this.standardDateDeviation);
		}
	}
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