'use strict';

const TI = require('../../');
const PDFElement = TI.PDF.Element.Base;
const config = TI.config;
const is = TI.is;
const db = TI.active;
const request = require('request');

/**
 * @extends {TI.PDF.Element.Base}
 */
class ImageElement extends PDFElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'image' : style);
		/**
		 * Original image parameters from source
		 * @type {TI.PhotoSize}
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
	 * @param {TI.PDF.Element.Offset} maxArea
	 */
	scale(maxArea) {
		switch (this.scaleTo) {
			case TI.PDF.Scale.Fit: this.fit(maxArea); break;
			case TI.PDF.Scale.Fill: this.fill(maxArea); break;
			default: super.scale(maxArea); break;
		}
	}

	/**
	 * Calculate new dimensions that fit within given boundaries
	 * @param {TI.PDF.Element.Offset} maxArea
	 */
	fit(maxArea) {
		let w = TI.PDF.pixelsToInches(this.original.width);
		let h = TI.PDF.pixelsToInches(this.original.height);

		if (w < maxArea.width && h < maxArea.height) {
			// fits at full size
			this.width = w;
			this.height = h;
		} else {
			// shrink
			let widthRatio = maxArea.width / w;
			let heightRatio = maxArea.height / h;

			if (widthRatio < heightRatio) {
				// width needs to shrink more
				this.width = maxArea.width;
				this.height = h * widthRatio;
			} else {
				this.height = maxArea.height;
				this.width = w * heightRatio;
			}

			this.top = maxArea.top;
			this.left = maxArea.left;
		}
	}

	/**
	 * Calculate dimensions and offsets to fill boundary
	 * @param {TI.PDF.Element.Offset} maxArea
	 */
	fill(maxArea) {
		let w = TI.PDF.pixelsToInches(this.original.width);
		let h = TI.PDF.pixelsToInches(this.original.height);
		let ratio = 1;

		if (w < maxArea.width || h < maxArea.height) {
			// need to stretch
			let widthRatio = maxArea.width / w;
			let heightRatio = maxArea.height / h;
			// grow by ratio needing to expand most
			ratio = (widthRatio > heightRatio) ? widthRatio : heightRatio;
		}

		this.width = w * ratio;
		this.height = h * ratio;
		// offset to center
		this.center(maxArea.width);
		this.top = (maxArea.height - this.height) / 2;
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {function} callback
	 */
	render(layout, callback) {
		this.explicitLayout(layout, this.offset);

		let p = this.offset.pixels;

		getImage(this.original.url, buffer => {
			layout.pdf.image(buffer, p.left, p.top, { width: p.width, height: p.height });
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