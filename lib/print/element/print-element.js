'use strict';

const is = require('../../is.js');

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
	}

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
			top: inchesToPixels(this.margin.top),
			left: inchesToPixels(this.margin.left),
			bottom: inchesToPixels(this.margin.bottom),
			right: inchesToPixels(this.margin.right)
		}
	}

	/**
	 * Padding as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get paddingPixels() {
		return {
			top: inchesToPixels(this.padding.top),
			left: inchesToPixels(this.padding.left),
			bottom: inchesToPixels(this.padding.bottom),
			right: inchesToPixels(this.padding.right)
		}
	}

	/**
	 * Layout values as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get layoutPixels() {
		return {
			top: inchesToPixels(this.top),
			left: inchesToPixels(this.left),
		    width: inchesToPixels(this.width),
			height: inchesToPixels(this.height)
		}
	}

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topPixels() { return inchesToPixels(this.top); }

	/**
	 * Left offset pixels
	 * @returns {Number}
	 */
	get leftPixels() { return inchesToPixels(this.left); }

	/**
	 * Width in pixels
	 * @returns {Number}
	 */
	get widthPixels() { return inchesToPixels(this.width); }

	/**
	 * Height in pixels
	 * @returns {Number}
	 */
	get heightPixels() { return inchesToPixels(this.height); }
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

// - Private static members ---------------------------------------------------

/**
 * PDF DPI is always 72 though images can be higher
 * @see https://github.com/devongovett/pdfkit/issues/268
 * @type {Number}
 */
const dpi = 72;

/**
 * @param {Number} inches
 * @returns {Number}
 */
function inchesToPixels(inches) { return inches * dpi; }

/**
 * @param {Number} pixels
 * @returns {Number}
 */
function pixelsToInches(pixels) { return pixels / dpi; }