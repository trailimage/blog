'use strict';

const is = require('../is.js');
const format = require('../format.js');
const config = require('../config.js');

class Photo {
	constructor() {
		/** @type {String} */
		this.id = null;
		/**
		 * URL to provider hosted image
		 * @type {String}
		 */
		this.sourceUrl = null;
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
		/**
		 * Photo date deviation from all photos in post
		 * Used to identify outliers that are likely screenshots or historical imagery
		 * @type {number}
		 * @see https://en.wikipedia.org/wiki/Standard_deviation#Basic_examples
		 */
		this.dateDeviation = 0;
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
	 * Comma-delimited list of tags
	 */
	get tagList() { return this.tags.toString(','); }
}

module.exports = Photo;