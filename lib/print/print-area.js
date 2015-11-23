'use strict';

const is = require('../is.js');

/**
 * Base class for printable areas
 */
class PrintArea {
	/**
	 * @param {PrintBook} [book] Book this area is part of
	 */
	constructor(book) {
		/** @type {Number} in inches */
		this.width = 0;
		/** @type {Number} in inches */
		this.height = 0;
		/** @type {Number} in inches */
		this.top = 0;
		/** @type {Number} in inches */
		this.left = 0;
		/** @type {Number} */
		this.dpi = is.value(book) ? book.dpi : 0;
		/** @type {Number} */
		this.align = align.left;
		/** @type {Number} */
		this.verticalAlign = align.top;
		/** @type {PrintBook} */
		this.book = is.value(book) ? book : null;
	}

	static get Align() { return align; }

	/**
	 * @param {ServerResponse|function} [res]
	 */
	render(res) { }

	/**
	 * @param {Number} inches
	 * @returns {number}
	 */
	inchesToPixels(inches) {
		return inches * this.dpi;
	}

	/**
	 * @param {Number} pixels
	 * @returns {number}
	 */
	pixelsToInches(pixels) {
		return pixels / this.dpi;
	}

	/**
	 * Width in pixels
	 * @returns {number}
	 */
	get pixelWidth() { return this.inchesToPixels(this.width); }

	/**
	 * Height in pixels
	 * @returns {number}
	 */
	get pixelHeight() { return this.inchesToPixels(this.height); }
}

module.exports = PrintArea;

// - Private static members ---------------------------------------------------

const align = {
	left: 0,
	center: 1,
	right: 2,
	top: 3,
	middle: 4,
	bottom: 5
};

