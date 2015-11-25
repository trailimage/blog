'use strict';

const is = require('../is.js');
const PrintSize = require('./print-size.js');

/**
 * Base class for printable elements
 */
class PrintElement {
	/**
	 * @param {PrintSize} [size]
	 */
	constructor(size) {
		/**
		 * @type {PrintSize}
		 * @private
		 */
		this._size = (size === undefined) ? new PrintSize() : size.copy();
		/** @type {Number} in pixels */
		this.top = 0;
		/** @type {Number} in pixels */
		this.left = 0;
		/** @type {Number} */
		this.align = PrintElement.Align.Left;
		/** @type {Number} */
		this.verticalAlign = PrintElement.Align.Top;
		/** @type {Object<Number>} */
		this.margin = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		};
		/** @type {Number} */
		this.zIndex = 0;
	}

	/**
	 * @returns {PrintSize}
	 */
	get size() { return this._size;	}

	/**
	 * @param {PrintSize} s
	 */
	set size(s) { this._size = s.copy(); }

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
	 * Set element position
	 * @param {Number} [left]
	 * @param {Number} [top]
	 */
	position(left, top) {
		if (is.number(top)) {
			this.top = top;
			if (is.number(left)) { this.left = left; }
		}
	}

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
	inchesToPixels(inches) { return inches * this.size.dpi;	}

	/**
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	pixelsToInches(pixels) { return pixels / this.size.dpi; }

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
	get widthInches() { return this.pixelsToInches(this.size.width); }

	/**
	 * @param {Number} x
	 */
	set widthInches(x) { this.size.width = this.inchesToPixels(x); }

	/**
	 * Height in inches
	 * @returns {Number}
	 */
	get heightInches() { return this.pixelsToInches(this.size.height); }

	/**
	 * @param {Number} x
	 */
	set heightInches(x) { this.size.height = this.inchesToPixels(x); }
}

PrintElement.Align = {
	Left: 0,
	Center: 1,
	Right: 2,
	Top: 3,
	Middle: 4,
	Bottom: 5
};

module.exports = PrintElement;
