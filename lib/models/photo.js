'use strict';

const is = require('../is.js');
const format = require('../format.js');
const config = require('../config.js');

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