'use strict';

const PrintArea = require('./print-area.js');
const config = require('../config.js');
const is = require('../is.js');
const db = config.provider;
const request = require('request');

/**
 * @extends {PrintArea}
 */
class PrintImage extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);
		/**
		 * Original image parameters from source
		 * @type {Size}
		 */
		this.original = null;
		/**
		 * Image title
		 * @type {String}
		 */
		this.title = null;

		this.background = false;
	}

	/**
	 * Whether image is portrait orientation
	 * @returns {Boolean}
	 */
	get isPortrait() {
		return (this.original !== null && this.original.height > this.original.width);
	}

	/**
	 * Adjust image dimensions to fit above caption box
	 * @param {PrintCaption} caption
	 */
	fitAbove(caption) {
		caption.belowImage(this);
		this.center();
		this.background = (this.left > 0);
	}

	/**
	 * Adjust image dimensions to fit beside caption box
	 * @param {PrintCaption} caption
	 */
	fitBeside(caption) {
		caption.besideImage(this);
	}

	/**
	 * Calculate new dimensions that fit within given boundaries
	 * @param {Number} width
	 * @param {Number} height
	 */
	fit(width, height) {
		let w = this.original.width;
		let h = this.original.height;

		if (w < width && h < height) {
			// fits at full size
			this.width = w;
			this.height = h;
		} else {
			// shrink
			let widthRatio = width / w;
			let heightRatio = height / h;

			if (widthRatio < heightRatio) {
				// width needs to shrink more
				this.width = width;
				this.height = Math.round(h * widthRatio);
			} else {
				this.height = height;
				this.width = Math.round(w * heightRatio);
			}
		}
	}

	/**
	 * Calculate dimensions and offsets to fill boundary
	 * @param {Number} [width]
	 * @param {Number} [height]
	 */
	fill(width, height) {
		if (width === undefined) { width = this.book.width; }
		if (height === undefined) { height = this.book.height; }

		let w = this.original.width;
		let h = this.original.height;
		let ratio = 1;

		if (w < width || h < height) {
			// need to stretch
			let widthRatio = width / w;
			let heightRatio = height / h;
			// grow by ratio needing to expand most
			ratio = (widthRatio > heightRatio) ? heightRatio : widthRatio;
		}

		this.width = w * ratio;
		this.height = h * ratio;
		// offset to center
		this.center(width);
		this.top = Math.round((height - this.height) / 2);
	}

	/**
	 * Calculate left offset to center within width
	 * @param {Number} [width] Use page width if not given
	 */
	center(width) {
		if (width === undefined) { width = this.book.width; }
		this.left = Math.round((width - this.width) / 2);
	}

	/**
	 * @param {ServerResponse|function} callback
	 */
	render(callback) {
		getImage(this.original.url, buffer => {
			if (this.background) {
				this.book.pdf.rect(0, 0, this.book.width, this.height).fill('black');
			}
			this.book.pdf.image(buffer, this.left, this.top, { width: this.width, height: this.height });
			callback();
		});
	}
}

module.exports = PrintImage;

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