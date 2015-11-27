'use strict';

const PDFElement = require('./pdf-element.js');
const config = require('../../config.js');
const is = require('../../is.js');
const db = config.provider;
const request = require('request');

/**
 * @extends {PDFElement}
 */
class ImageElement extends PDFElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'image' : style);
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
	 * @param {Number} maxWidth
	 * @param {Number} maxHeight
	 */
	scale(maxWidth, maxHeight) {
		switch (this.scaleType) {
			case PDFElement.Scale.Fit: this.fit(maxWidth, maxHeight); break;
			case PDFElement.Scale.Fill: this.fill(maxWidth, maxHeight); break;
		}
	}

	/**
	 * Calculate new dimensions that fit within given boundaries
	 * @param {Number} maxWidth
	 * @param {Number} maxHeight
	 */
	fit(maxWidth, maxHeight) {
		let w = this.pixelsToInches(this.original.width);
		let h = this.pixelsToInches(this.original.height);

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
		let w = this.pixelsToInches(this.original.width);
		let h = this.pixelsToInches(this.original.height);
		let ratio = 1;

		if (w < maxWidth || h < maxHeight) {
			// need to stretch
			let widthRatio = maxWidth / w;
			let heightRatio = maxHeight / h;
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
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(style, pdf, callback) {
		this.updateLayout(style);

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