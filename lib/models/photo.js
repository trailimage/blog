'use strict';

const is = require('../is.js');

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
		 * Whether taken date is an outlier compared to other photos in the same post
		 * @type {boolean}
		 * @see http://www.wikihow.com/Calculate-Outliers
		 */
		this.outlierDate = false;
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