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
	 * @param {Number} maxWidth
	 * @param {Number} maxHeight
	 */
	fit(maxWidth, maxHeight) {
		let w = this.original.width;
		let h = this.original.height;

		if (w < maxWidth && h < maxHeight) {
			// fits at full size
			this.width = w;
			this.height = h;
		} else {
			// shrink
			let widthRatio = maxWidth / w;
			let heightRatio = maxHeight / h;

			if (widthRatio < heightRatio) {
				// width needs to shrink more
				this.width = maxWidth;
				this.height = Math.round(h * widthRatio);
			} else {
				this.height = maxHeight;
				this.width = Math.round(w * heightRatio);
			}
		}
	}

	/**
	 * Calculate dimensions and offsets to fill boundary
	 * @param {Number} maxWidth
	 * @param {Number} maxHeight
	 */
	fill(maxWidth, maxHeight) {
		let w = this.original.width;
		let h = this.original.height;
		let ratio = 1;

		if (w < size.width || h < size.height) {
			// need to stretch
			let widthRatio = size.width / w;
			let heightRatio = size.height / h;
			// grow by ratio needing to expand most
			ratio = (widthRatio > heightRatio) ? heightRatio : widthRatio;
		}

		this.width = w * ratio;
		this.height = h * ratio;
		// offset to center
		this.center(maxWidth);
		this.top = Math.round((maxHeight - this.height) / 2);
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let p = this.layoutPixels;

		getImage(this.original.url, buffer => {
			pdf.image(buffer, p.left, p.top, { width: p.width, height: p.height });
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