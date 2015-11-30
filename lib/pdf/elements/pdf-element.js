'use strict';

const is = require('../../is.js');
const Layout = require('../pdf-layout.js');

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
		this.alignContent = Layout.Align.Left;
		/** @type {String} */
		this.verticalAlign = Layout.Align.Top;
		/**
		 * How to scale element
		 * @type {String}
		 */
		this.scaleTo = Layout.Scale.None;

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
		 * @type {boolean}
		 * @protected
		 */
		this.laidOut = false;

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
	scale(maxWidth, maxHeight) {
		if (!isNaN(this.left) && !isNaN(this.right)) {
			this.width = maxWidth - (this.left + this.right);
		}
		if (!isNaN(this.top) && !isNaN(this.bottom)) {
			this.height = maxHeight - (this.top + this.bottom);
		}
	}

	/**
	 * @param {PDFLayout} layout
	 */
	updateLayout(layout) { if (!this.laidOut) { layout.applyTo(this); this.laidOut = true; } }

	/**
	 * @param {PDFLayout} layout
	 * @param {function} [callback]
	 */
	render(layout, callback) { this.updateLayout(layout); }

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
			top: Layout.inchesToPixels(this.margin.top),
			left: Layout.inchesToPixels(this.margin.left),
			bottom: Layout.inchesToPixels(this.margin.bottom),
			right: Layout.inchesToPixels(this.margin.right)
		}
	}

	/**
	 * Padding as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get paddingPixels() {
		return {
			top: Layout.inchesToPixels(this.padding.top),
			left: Layout.inchesToPixels(this.padding.left),
			bottom: Layout.inchesToPixels(this.padding.bottom),
			right: Layout.inchesToPixels(this.padding.right)
		}
	}

	/**
	 * Layout values as pixels rather than inches
	 * @return {Object.<Number>}
	 */
	get layoutPixels() {
		return {
			top: Layout.inchesToPixels(this.top),
			left: Layout.inchesToPixels(this.left),
		   width: Layout.inchesToPixels(this.width),
			height: Layout.inchesToPixels(this.height)
		}
	}

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topPixels() { return Layout.inchesToPixels(this.top); }

	/**
	 * Left offset pixels
	 * @returns {Number}
	 */
	get leftPixels() { return Layout.inchesToPixels(this.left); }

	/**
	 * Width in pixels
	 * @returns {Number}
	 */
	get widthPixels() { return Layout.inchesToPixels(this.width); }

	/**
	 * Height in pixels
	 * @returns {Number}
	 */
	get heightPixels() { return Layout.inchesToPixels(this.height); }

	/**
	 * Set height in pixels
	 * @param {Number} p
	 */
	set heightPixels(p) { this.height = Layout.pixelsToInches(p); }

	/**
	 * Calculate left offset to center within width
	 * @param {Number} [width]
	 */
	center(width) {
		if (isNaN(this.width)) {
			this.alignContent = Layout.Align.Center;
		} else {
			this.left = (width - this.width) / 2;
		}
	}
}

module.exports = PDFElement;