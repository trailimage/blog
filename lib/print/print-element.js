'use strict';

const is = require('../is.js');

/**
 * Base class for printable elements
 */
class PrintElement {
	constructor(dpi) {
		/** @type {Number} in pixels */
		this.width = 0;
		/** @type {Number} in pixels */
		this.height = 0;
		/** @type {Number} in pixels */
		this.top = 0;
		/** @type {Number} in pixels */
		this.left = 0;
		/** @type {Number} */
		this.align = align.Left;
		/** @type {Number} */
		this.verticalAlign = align.Top;
		/** @type {Number} */
		this.dpi = dpi;
		/** @type {Object<Number>} */
		this.margin = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		};
	}

	static get Align() { return align; }

	/**
	 * Apply settings to PDF
	 * @param {PDFDocument} pdf
	 * @return {PDFDocument}
	 */
	configure(pdf) {}

	/**
	 * @param {ServerResponse|PDFDocument} resOrPdf
	 * @param {function} [callback]
	 */
	render(resOrPdf, callback) { }

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

module.exports = PrintElement;

// - Private static members ---------------------------------------------------

const align = {
	Left: 0,
	Center: 1,
	Right: 2,
	Top: 3,
	Middle: 4,
	Bottom: 5
};

