'use strict';

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
		/** @type {Number} in inches */
		this.align = align.left;
		this.verticalAlign = align.top;
		this.book = (book === undefined) ? null : book;
		/** @type {Number} */
		this.dpi = 0;
	}

	static get Align() { return align; }

	/**
	 * @param {ServerResponse} [res]
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

