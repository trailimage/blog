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
		/** @type {Video} */
		this.video = null;
		/**
		 * @type {Photo[]}
		 */
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
		/**
		 * Serialized photo coordinates used to generate static map
		 * @type {String}
		 * @see https://developers.google.com/maps/documentation/static-maps/intro
		 * @private
		 */
		this.photoCoordinates = null;

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
		/** @type {boolean} */
		this.hasTrack = false;
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
		/** @type {Photo} */
		this.thumb = null;
		/**
		 * Whether post pictures occurred at a specific point in time
		 * Exceptions are themed sets
		 * @type {Boolean}
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
	 * Assign photos to post and calculate summaries
	 * @param {Photo[]} list
	 */
	addPhotos(list) {
		this.photos = list;

		if (this.photos.length > 0) {
			/** @type {Library} */
			let library = require('./library.js').current;

			this.thumb = this.photos.find(p => p.primary);

			// also updates photo tag slugs to full names
			this.photoTagList = library.photoTagList(this.photos);

			if (this.chronological) {
				this._identifyPhotoDateOutliers();
				/** @type {Photo} */
				let firstDatedPhoto = this.photos.find(p => !p.outlierDate);
				if (is.value(firstDatedPhoto)) { this.dateTaken = format.date(firstDatedPhoto.dateTaken); }
			}

			if (!is.empty(this.description)) {
				this.longDescription = `${this.description} (Includes ${this.photos.length} photos`;
				this.longDescription += (is.value(this.video) && !this.video.empty) ? ' and one video)' : ')';
			}

			this._serializePhotoCoordinates();
			this.photosLoaded = true;
		}
	}

	/**
	 * Title and optional subtitle
	 * @returns {string}
	 */
	name() {
		// context is screwed up when called from HBS template
		/** @type {Post} */
		let p = (this instanceof Post) ? this : this.post;
		return p.title + ((p.isPartial) ? ': ' + p.subTitle : '');
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
	 * For post titles that looked like part of a series (had a colon separator) but had no other parts
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
	 * Simplistic outlier calculation
	 * @private
	 * @see https://en.wikipedia.org/wiki/Outlier
	 * @see http://www.wikihow.com/Calculate-Outliers
	 */
	_identifyPhotoDateOutliers() {
		let fence = outlierBoundary(this.photos.map(p => p.dateTaken.getTime()));

		if (fence !== null) {
			for (let p of this.photos) {
				let d = p.dateTaken.getTime();
				if (d > fence.max || d < fence.min) { p.outlierDate = true; }
			}
		}
	}

	/**
	 * Coordinate property used by Google's static maps
	 * @return {String} Comma delimited list of coordinates
	 * @see https://developers.google.com/maps/documentation/static-maps/intro
	 * TODO: render details don't belong here
	 */
	_serializePhotoCoordinates() {
		let start = 1;  // always skip first photo
		let total = this.photos.length;
		let map = '';

		if (total > config.map.maxMarkers) {
			start = 5;  // skip the first few which are often just prep shots
			total = config.map.maxMarkers + 5;
			if (total > this.photos.length) { total = this.photos.length; }
		}

		for (let i = start; i < total; i++) {
			let p = this.photos[i];
			if (p.latitude > 0) { map += '|' + p.latitude + ',' + p.longitude; }
		}

		this.photoCoordinates = (is.empty(map)) ? null : encodeURIComponent('size:tiny' + map);
	}
}

module.exports = Post;

// - Private static members ---------------------------------------------------

/**
 * Simplistic outlier calculation using interquartiles
 * @param {Number[]} values
 * @param {Number} [distance] 3 is typical for major outliers, 1.5 for minor
 * @see https://en.wikipedia.org/wiki/Outlier
 * @see http://www.wikihow.com/Calculate-Outliers
 */
function outlierBoundary(values, distance) {
	if (!is.array(values) || values.length === 0) { return null; }
	if (distance === undefined) { distance = 3; }

	// sort lowest to highest
	values.sort((d1, d2) => d1 - d2);
	let half = Math.floor(values.length / 2);
	let q1 = median(values.slice(0, half));
	let q3 = median(values.slice(half));
	let range = q3 - q1;

	return {
		min: q1 - (range * distance),
		max: q3 + (range * distance)
	};
}

/**
 * @param {Number[]} values Assumes they're already sorted
 * @returns {Number}
 */
function median(values) {
	let half = Math.floor(values.length / 2);
	return (values.length % 2 !== 0) ? values[half] : (values[half-1] + values[half]) / 2.0;
}

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