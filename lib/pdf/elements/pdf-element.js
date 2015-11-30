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
class PDFElement {
	/**
	 * All dimensions in inches
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
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

		/** @type {String} */
		this.alignContent = PDFElement.Align.Left;
		/** @type {String} */
		this.verticalAlign = PDFElement.Align.Top;
		/**
		 * How to scale element
		 * @type {String}
		 */
		this.scaleType = PDFElement.Scale.None;

		/**
		 * Style name to match in pdf-style.json rules
		 * @type {String}
		 */
		this.style = style;

		/**
		 * RGB color
		 * @type {Number[]}
		 */
		this._color = [0, 0, 0, 1];

		/**
		 * RGBA color
		 * @type {Number[]}
		 */
		this.backgroundColor = [];

		/** @type {Object<Number>} */
		this.margin = {
			top: NaN,
			left: NaN,
			right: NaN,
			bottom: NaN
		};

		/** @type {Object<Number>} */
		this.padding = {
			top: NaN,
			left: NaN,
			right: NaN,
			bottom: NaN
		};

		/** @type {Number} */
		this.zIndex = 0;
	}

	/**
	 * @returns {Number[]}
	 */
	get color() {
		if (is.array(this._color)) {
			return (this._color.length > 3) ? this._color.slice(0, 3) : this._color;
		} else {
			return [0, 0, 0];
		}
	}

	/**
	 * @param {Number[]} c
	 */
	set color(c) { this._color = c; }

	/**
	 *
	 * @returns {Number}
	 */
	get opacity() {
		return (is.array(this._color) && this._color.length > 3) ? this._color[3] : 1;
	}

	/**
	 * @param {Number} a
	 */
	set opacity(a) {
		if (is.array(this._color)) {
			this._color[3] = a;
		} else {
			this._color = [0, 0, 0, a];
		}
	}

	/**
	 * Scale element to fit within dimensions
	 * @param {Number} maxWidth
	 * @param {Number} maxHeight
	 */
	scale(maxWidth, maxHeight) {}

	/**
	 * @param {PDFStyle} style
	 */
	updateLayout(style) { style.applyTo(this); }

	/**
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} [callback]
	 */
	render(style, pdf, callback) { this.updateLayout(style); }

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
			top: PDFElement.inchesToPixels(this.margin.top),
			left: PDFElement.inchesToPixels(this.margin.left),
			bottom: PDFElement.inchesToPixels(this.margin.bottom),
			right: PDFElement.inchesToPixels(this.margin.right)
		}
	}

	/**
	 * Padding as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get paddingPixels() {
		return {
			top: PDFElement.inchesToPixels(this.padding.top),
			left: PDFElement.inchesToPixels(this.padding.left),
			bottom: PDFElement.inchesToPixels(this.padding.bottom),
			right: PDFElement.inchesToPixels(this.padding.right)
		}
	}

	/**
	 * Layout values as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get layoutPixels() {
		return {
			top: PDFElement.inchesToPixels(this.top),
			left: PDFElement.inchesToPixels(this.left),
		    width: PDFElement.inchesToPixels(this.width),
			height: PDFElement.inchesToPixels(this.height)
		}
	}

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topPixels() { return PDFElement.inchesToPixels(this.top); }

	/**
	 * Left offset pixels
	 * @returns {Number}
	 */
	get leftPixels() { return PDFElement.inchesToPixels(this.left); }

	/**
	 * Width in pixels
	 * @returns {Number}
	 */
	get widthPixels() { return PDFElement.inchesToPixels(this.width); }

	/**
	 * Height in pixels
	 * @returns {Number}
	 */
	get heightPixels() { return PDFElement.inchesToPixels(this.height); }

	/**
	 * Set height in pixels
	 * @param {Number} p
	 */
	set heightPixels(p) { this.height = PDFElement.pixelsToInches(p); }

	/**
	 * Calculate left offset to center within width
	 * @param {Number} [width]
	 */
	center(width) {
		if (!isNaN(this.width)) { this.left = (width - this.width) / 2; }
		// cascade value
		this.alignContent = PDFElement.Align.Center;
	}

	/**
	 * @param {Number} inches
	 * @returns {Number}
	 */
	static inchesToPixels(inches) { return inches * dpi; }

	/**
	 * @param {Number} pixels
	 * @returns {Number}
	 */
	static pixelsToInches(pixels) { return pixels / dpi; }
}

PDFElement.Align = {
	Left: 'left',
	Center: 'center',
	Right: 'right',
	Top: 'top',
	Middle: 'middle',
	Bottom: 'bottom',
	Justify: 'justify',
	Inherit: 'inherit'
};

PDFElement.Scale = {
	Fit: 'fit',
	Fill: 'fill',
	None: 'none'
};

module.exports = PDFElement;