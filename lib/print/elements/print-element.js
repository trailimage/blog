'use strict';

const is = require('../../is.js');
/**
 * PDF DPI is always 72 though images can be higher
 * @see https://github.com/devongovett/pdfkit/issues/268
 * @type {Number}
 */
const dpi = 72;

/**
 * Base class for printable elements
 */
class PrintElement {
	/**
	 * All dimensions in inches
	 */
	constructor() {
		/** @type {Number} */
		this.top = NaN;
		/** @type {Number} */
		this.left = NaN;
		/** @type {Number} */
		this.right = NaN;
		/** @type {Number} */
		this.bottom = NaN;
		/** @type {Number} */
		this.width = NaN;
		/** @type {Number} */
		this.height = NaN;
		/** @type {Number} */
		this.minWidth = NaN;
		/** @type {Number} */
		this.minHeight = NaN;

		/** @type {Number} */
		this.alignContent = PrintElement.Align.Left;
		/** @type {Number} */
		this.verticalAlign = PrintElement.Align.Top;

		/**
		 * RGB color
		 * @type {Number[]}
		 */
		this.color = [0, 0, 0];

		/**
		 * RGBA color
		 * @type {Number[]}
		 */
		this.backgroundColor = [];

		/** @type {Object<Number>} */
		this.margin = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		};

		/** @type {Object<Number>} */
		this.padding = {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0
		};

		/** @type {Number} */
		this.zIndex = 0;

		/**
		 * Whether element has been laid out for PDF
		 * @type {boolean}
		 */
		this.laidOut = false;
	}

	/**
	 * @param {PDFDocument} pdf
	 */
	updateLayout(pdf) {	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} [callback]
	 */
	render(pdf, callback) { }

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
	set allMargins(x) {
		this.margin.top = x;
		this.margin.left = x;
		this.margin.bottom = x;
		this.margin.right = x;
	}

	/**
	 * Set all margins to same value
	 * @param {Number} x
	 */
	set allPadding(x) {
		this.padding.top = x;
		this.padding.left = x;
		this.padding.bottom = x;
		this.padding.right = x;
	}

	/**
	 * Margins as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get marginPixels() {
		return {
			top: this.inchesToPixels(this.margin.top),
			left: this.inchesToPixels(this.margin.left),
			bottom: this.inchesToPixels(this.margin.bottom),
			right: this.inchesToPixels(this.margin.right)
		}
	}

	/**
	 * Padding as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get paddingPixels() {
		return {
			top: this.inchesToPixels(this.padding.top),
			left: this.inchesToPixels(this.padding.left),
			bottom: this.inchesToPixels(this.padding.bottom),
			right: this.inchesToPixels(this.padding.right)
		}
	}

	/**
	 * Layout values as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get layoutPixels() {
		return {
			top: this.inchesToPixels(this.top),
			left: this.inchesToPixels(this.left),
		    width: this.inchesToPixels(this.width),
			height: this.inchesToPixels(this.height)
		}
	}

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topPixels() { return this.inchesToPixels(this.top); }

	/**
	 * Left offset pixels
	 * @returns {Number}
	 */
	get leftPixels() { return this.inchesToPixels(this.left); }

	/**
	 * Width in pixels
	 * @returns {Number}
	 */
	get widthPixels() { return this.inchesToPixels(this.width); }

	/**
	 * Height in pixels
	 * @returns {Number}
	 */
	get heightPixels() { return this.inchesToPixels(this.height); }

	/**
	 * Set height in pixels
	 * @param {Number} p
	 */
	set heightPixels(p) { this.height = this.pixelsToInches(p); }

	/**
	 * Calculate left offset to center within width
	 * @param {Number} [width]
	 */
	center(width) {
		if (!isNaN(this.width)) { this.left = Math.round((width - this.width) / 2); }
		// cascade value
		this.alignContent = PrintElement.Align.Center;
	}

	/**
	 * @param {Number} inches
	 * @returns {Number}
	 */
	inchesToPixels(inches) { return inches * dpi; }

	/**
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	pixelsToInches(pixels) { return pixels / dpi; }
}

PrintElement.Align = {
	Left: 0,
	Center: 1,
	Right: 2,
	Top: 3,
	Middle: 4,
	Bottom: 5,
	Justify: 6
};

module.exports = PrintElement;