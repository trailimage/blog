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
		/** @type {Number} in pixels */
		this.width = 0;
		/** @type {Number} in pixels */
		this.height = 0;
		/** @type {Number} in pixels */
		this.top = 0;
		/** @type {Number} in pixels */
		this.left = 0;
		/** @type {Number} */
		this.dpi = is.value(book) ? book.dpi : 0;
		/** @type {Number} */
		this.align = align.left;
		/** @type {Number} */
		this.verticalAlign = align.top;
		/** @type {Object<Number>} */
		this.margin = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		};
		/** @type {PrintBook} */
		this.book = is.value(book) ? book : null;
	}

	static get Align() { return align; }

	/**
	 * @param {ServerResponse|function} [res]
	 */
	render(res) { }

	/**
	 * Set all margins to same value
	 * @param {Number} x
	 */
	set margins(x) {
		this.margin.top = x;
		this.margin.left = x;
		this.margin.bottom = x;
		this.margin.right = x;
	}

	/**
	 * @param {Number} x
	 */
	set marginInches(x) {
		this.margins = this.inchesToPixels(x);
	}

	/**
	 * @param {Number} inches
	 * @returns {Number}
	 */
	inchesToPixels(inches) { return inches * this.dpi;	}

	/**
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	pixelsToInches(pixels) { return pixels / this.dpi; }

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topInches() { return this.pixelsToInches(this.top); }

	/**
	 * @param {Number} x
	 */
	set topInches(x) { this.top = this.inchesToPixels(x); }

	/**
	 * Left offset inches
	 * @returns {Number}
	 */
	get leftInches() { return this.pixelsToInches(this.left); }

	/**
	 * @param {Number} x
	 */
	set leftInches(x) { this.left = this.inchesToPixels(x); }

	/**
	 * Width in inches
	 * @returns {Number}
	 */
	get widthInches() { return this.pixelsToInches(this.width); }

	/**
	 * @param {Number} x
	 */
	set widthInches(x) { this.width = this.inchesToPixels(x); }

	/**
	 * Height in inches
	 * @returns {Number}
	 */
	get heightInches() { return this.pixelsToInches(this.height); }

	/**
	 * @param {Number} x
	 */
	set heightInches(x) { this.height = this.inchesToPixels(x); }
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

