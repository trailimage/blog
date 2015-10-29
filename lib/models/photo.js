'use strict';

const format = require('./../format.js');
const setting = require('./../settings.js');
const flickr = require('../providers/flickr.js');
const Size = require('./size.js');

class Photo {
	constructor() {
		this.id = 0;
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
	 * Comma-delimited list of tags
	 */
	get tagList() { return this.tags.toString(','); }

	/**
	 * Sizes used to render photos in a post
	 * @returns {String[]}
	 */
	static get sizesForPost() {
		return [
			flickr.size.small240,       // preview size
			flickr.size.medium640,      // final fallback (some older image have no size larger than 640x480)
			flickr.size.medium800,      // first fallback
			flickr.size.large1024,      // default size
			flickr.size.large2048       // enlarged size
		];
	}

	/**
	 * Sizes used to render photo tag search
	 * @returns {String[]}
	 */
	static get sizesForSearch() { return [flickr.size.square150]; }
}

module.exports = Photo;