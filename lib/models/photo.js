'use strict';

const is = require('../is.js');
const format = require('../format.js');
const config = require('../config.js');
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
	 * @param {Object.<String>} sizeField Defined in LibraryProvider
	 * @param {Number} index Position of photo in list
	 * @return {Photo}
	 */
	static parse(s, sizeField, index) {
		let p = new Photo();
		let normal = (is.array(sizeField.fallbacks))
			? [sizeField.normal].concat(sizeField.fallbacks)
			: sizeField.normal;

		p.id = s.id;
		p.index = index + 1;
		p.title = s.title;
		p.description = s.description._content;
		p.tags = s.tags.split(' ');
		p.dateTaken = format.parseDate(s.datetaken);
		p.latitude = parseFloat(s.latitude);
		p.longitude = parseFloat(s.longitude);
		p.primary = (parseInt(s.isprimary) == 1);
		p.size.preview = Size.parse(s, sizeField.preview);
		p.size.normal = Size.parse(s, normal);
		p.size.big = Size.parse(s, sizeField.big);
		return p;
	}

	/**
	 * Parse Flickr photo summary used in thumb search
	 * @param {Flickr.PhotoSummary} s
	 * @param {String} sizeField
	 * @return {Photo}
	 */
	static parseThumb(s, sizeField) {
		let p = new Photo();
		p.id = s.id;
		p.size.thumb = Size.parse(s, sizeField);
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

		if (total > config.google.maxMarkers) {
			start = 5;  // skip the first few which are often just prep shots
			total = config.google.maxMarkers + 5;
			if (total > photos.length) { total = photos.length; }
		}

		for (let i = start; i < total; i++) {
			let p = photos[i];
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