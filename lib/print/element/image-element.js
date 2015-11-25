'use strict';

const PrintElement = require('./print-element.js');
const config = require('../../config.js');
const is = require('../../is.js');
const db = config.provider;
const request = require('request');

/**
 * @extends {PrintElement}
 */
class ImageElement extends PrintElement {
	constructor() {
		super();
		/**
		 * Original image parameters from source
		 * @type {Size}
		 */
		this.original = null;
	}

	/**
	 * Whether image is portrait orientation
	 * @returns {Boolean}
	 */
	get isPortrait() {
		return (this.original !== null && this.original.height > this.original.width);
	}

	/**
	 * Calculate new dimensions that fit within given boundaries
	 * @param {PrintSize} size
	 */
	fit(size) {
		let w = this.original.width;
		let h = this.original.height;
		let newSize = this.size.copy();

		if (w < size.width && h < size.height) {
			// fits at full size
			newSize.width = w;
			newSize.height = h;
		} else {
			// shrink
			let widthRatio = size.width / w;
			let heightRatio = size.height / h;

			if (widthRatio < heightRatio) {
				// width needs to shrink more
				newSize.width = size.width;
				newSize.height = Math.round(h * widthRatio);
			} else {
				newSize.height = size.height;
				newSize.width = Math.round(w * heightRatio);
			}
		}
		// triger resize event
		this.size = newSize;
	}

	/**
	 * Calculate dimensions and offsets to fill boundary
	 * @param {PrintSize} size Container size
	 */
	fill(size) {
		let w = this.original.width;
		let h = this.original.height;
		let newSize = this.size.copy();
		let ratio = 1;

		if (w < size.width || h < size.height) {
			// need to stretch
			let widthRatio = size.width / w;
			let heightRatio = size.height / h;
			// grow by ratio needing to expand most
			ratio = (widthRatio > heightRatio) ? heightRatio : widthRatio;
		}

		newSize.width = w * ratio;
		newSize.height = h * ratio;
		// trigger resize event
		this.size = newSize;
		// offset to center
		this.center(size);
		this.top = Math.round((size.height - this.height) / 2);
	}

	/**
	 * Calculate left offset to center within width
	 * @param {PrintSize} size
	 */
	center(size) {
		this.left = Math.round((size.width - this.size.width) / 2);
	}

	/**
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		getImage(this.original.url, buffer => {
			pdf.image(buffer, this.left, this.top, { width: this.width, height: this.height });
			callback();
		});
	}
}

module.exports = ImageElement;

// - Private static members ---------------------------------------------------

/**
 * Load image bytes
 * @param {String} url
 * @param {function(Buffer)} callback
 */
function getImage(url, callback) {
	// null encoding defaults to binary Buffer
	let options = { url: url, encoding: null };

	if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

	request(options, (error, response, data) => {
		if (error !== null) {
			db.log.error('%s when accessing %s', error.toString(), url);
		} else {
			callback(data);
		}
	});
}