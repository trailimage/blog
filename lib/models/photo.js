'use strict';

const is = require('../is.js');
const format = require('../format.js');
const setting = require('../settings.js');
const Size = require('./size.js');

class Photo {
	constructor() {
		/** @type {String} */
		this.id = null;
		/**
		 * One-based position of photo in list
		 * @type {number}
		 */
		this.index = 0;
		/** @type {String} */
		this.title = null;
		/** @type {String} */
		this.description = null;
		/**
		 * Initially populated with tag slugs then updated to tag names
		 * @type {String[]}
		 */
		this.tags = [];
		/** @type {Date} */
		this.dateTaken = null;
		/** @type {Number} */
		this.latitude = 0;
		/** @type {Number} */
		this.longitude = 0;
		/**
		 * Whether photo represents the set
		 * @type {Boolean}
		 */
		this.primary = false;

		/**
		 * Standard sizes
		 * @type {Object.<Size>}
		 */
		this.size = {
			thumb: null,
			preview: null,
			normal: null,
			big: null
		}
	}

	/**
	 * Parse Flickr photo summary
	 * @param {Flickr.PhotoSummary} s
	 * @param {Number} index Position of photo in list
	 * @return {Photo}
	 */
	static parse(s, index) {
		let p = new Photo();
		p.id = s.id;
		p.index = index + 1;
		p.title = s.title;
		p.description = s.description._content;
		p.tags = s.tags.split(' ');
		p.dateTaken = format.parseDate(s.datetaken);
		p.latitude = parseFloat(s.latitude);
		p.longitude = parseFloat(s.longitude);
		p.primary = (parseInt(s.isprimary) == 1);
		p.size.preview = Size.parse(s, flickr.size.small240);
		p.size.normal = Size.parse(s, [flickr.size.large1024, flickr.size.medium800, flickr.size.medium640]);
		p.size.big = Size.parse(s, flickr.size.large2048);
		return p;
	}

	/**
	 * Parse Flickr photo summary used in thumb search
	 * @param {Flickr.PhotoSummary} s
	 * @return {Photo}
	 */
	static parseThumb(s) {
		let p = new Photo();
		p.id = s.id;
		p.size.thumb = Size.parse(s, flickr.size.square150);
		return p;
	}

	/**
	 * Build coordinate property used by Google Maps
	 * @param {Photo[]} photos
	 * @return {String} Comma delimited list of coordinates
	 */
	static coordinateList(photos) {
		let start = 1;  // always skip first photo
		let total = photos.length;
		let map = '';

		if (total > setting.google.maxMarkers) {
			start = 5;  // skip the first few which are often just prep shots
			total = setting.google.maxMarkers + 5;
			if (total > photos.length) { total = photos.length; }
		}

		for (let p of photos) {
			if (p.latitude > 0) { map += '|' + p.latitude + ',' + p.longitude; }
		}

		return (is.empty(map)) ? null : encodeURIComponent('size:tiny' + map);
	}

	/**
	 * Overall date for a set of photos
	 * Could sort and average
	 * @param {Photo[]} photos
	 * @return {String}
	 */
	static getDateTaken(photos) {
		/** @type {int} */
		let firstDatedPhoto = 2;    // use third photo in case the first few are generated map images

		if (photos.length <= firstDatedPhoto) { firstDatedPhoto = photos.length - 1; }
		return format.date(photos[firstDatedPhoto].dateTaken);
	}

	/**
	 * Comma-delimited list of tags
	 */
	get tagList() { return this.tags.toString(','); }
}

module.exports = Photo;