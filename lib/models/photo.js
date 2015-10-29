'use strict';

const format = require('./../format.js');
const setting = require('./../settings.js');
const flickr = require('../providers/flickr.js');
const Size = require('./size.js');

class Photo {
	/**
	 * @param {Flickr.PhotoSummary} s
	 * @param {Number} index
	 */
	constructor(s, index) {
		this.id = s.id;
		/**
		 * One-based position of photo in list
		 * @type {number}
		 */
		this.index = index + 1;
		/** @type {String} */
		this.title = s.title;
		/** @type {String} */
		this.description = s.description._content;
		/**
		 * Initially populated with tag slugs then updated to tag names
		 * @type {String[]}
		 */
		this.tags = s.tags.split(' ');
		/** @type {Date} */
		this.dateTaken = format.parseDate(s.datetaken);
		/** @type {Number} */
		this.latitude = parseFloat(s.latitude);
		/** @type {Number} */
		this.longitude = parseFloat(s.longitude);
		/**
		 * @type {Boolean}
		 */
		this.primary = (parseInt(s.isprimary) == 1);

		/**
		 * Standard sizes
		 * @type {Object.<Size>}
		 */
		this.size = {
			thumb: new Size(s, flickr.size.small240),
			preview: new Size(s, flickr.size.small240),
			normal: new Size(s, [flickr.size.large1024, flickr.size.medium800, flickr.size.medium640]),
			big: new Size(s, flickr.size.large2048)
		}
	}

	/**
	 * Comma-delimited list of tags
	 */
	get tagList() { return this.tags.toString(','); }

	/**
	 * List of size codes for Flickr call
	 * @returns {String[]}
	 */
	static sizeCodes() {
		return [
			flickr.size.small240,       // thumbnail preview
			flickr.size.small320,
			flickr.size.medium500,
			flickr.size.medium640,      // some older image have no size larger than 640x480
			flickr.size.medium800,
			flickr.size.large1024,      // default size
			flickr.size.large2048       // enlarged size
		];
	}
}

module.exports = Photo;