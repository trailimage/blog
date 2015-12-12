'use strict';

const TI = require('../../');
const is = TI.is;
const Area = TI.PDF.Element.Area;

/**
 * Base class for printable elements
 * @namespace TI.PDF.Element.Base
 */
class PDFElement {
	/**
	 * All dimensions in inches
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		/**
		 * Right-side distance from containing area
		 * @type {Number}
		 */
		this.right = NaN;
		/**
		 * Bottom distance from containing area
		 * @type {Number}
		 */
		this.bottom = NaN;
		/**
		 * Dimensions
		 * @type {TI.PDF.Element.Area}
		 */
		this.area = new Area();
		/** @type {Number} */
		this.minWidth = NaN;
		/** @type {Number} */
		this.minHeight = NaN;
		/** @type {String} */
		this.alignContent = TI.PDF.Align.Left;
		/** @type {String} */
		this.verticalAlign = TI.PDF.Align.Top;
		/**
		 * How to scale element
		 * @type {String}
		 */
		this.scaleTo = TI.PDF.Scale.None;

		/**
		 * Style name to match in pdf-style.json rules
		 * @namespace TI.PDF.Element.Base.style
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

		/** @type {Number} */
		this.zIndex = 0;
	}

	/** @param {Number} n */
	set width(n) { this.area.width = n; }
	/** @return {Number} */
	get width() { return this.area.width; }

	/** @param {Number} n */
	set height(n) { this.area.height = n; }
	/** @return {Number} */
	get height() { return this.area.height; }

	/** @param {Number} n */
	set left(n) { this.area.left = n; }
	/** @return {Number} */
	get left() { return this.area.left; }

	/** @param {Number} n */
	set top(n) { this.area.top = n; }
	/** @return {Number} */
	get top() { return this.area.top; }

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
	 * Whether full layout is defined for PDF rendering
	 * @returns {Boolean}
	 */
	get laidOut() { return !this.area.isEmpty; }

	/**
	 * Set width and height for elements with anchored opposite edges
	 * Previously set width and height will be replaced
	 * @param {TI.PDF.Element.Area} maxArea
	 */
	scale(maxArea) {
		if (!isNaN(this.left) && !isNaN(this.right)) {
			// adjust width to fit left and right parameters
			this.width = maxArea.width - (this.left + this.right);
		}

		if (!isNaN(this.top) && !isNaN(this.bottom)) {
			// adjust height to fit top and bottom parameters
			this.height = maxArea.height - (this.top + this.bottom);
		}
	}

	/**
	 * Position elements that are anchored to only one edge
	 * @param {TI.PDF.Element.Area} area
	 */
	positionWithin(area) {
		if (!isNaN(this.bottom) && !isNaN(this.height) && isNaN(this.top)) {
			// position relative to bottom
			this.top = area.height - (this.height + this.bottom);
		}

		if (!isNaN(this.right) && !isNaN(this.width) && isNaN(this.left)) {
			// position relative to right
			this.left = area.width - (this.width + this.right);
		}
	}

	/**
	 * Apply style rules and copy parent area values
	 * @param {TI.PDF.Layout} layout
	 * @param {TI.PDF.Element.Area} area
	 */
	explicitLayout(layout, area) {
		layout.applyTo(this);
		if (this.area.isEmpty) { this.area.copy(this.area);	}
		if (is.value(area)) { this.area.add(area); }
	}

	/**
	 * Calculate missing area values
	 * @param {TI.PDF.Element.Area} offset
	 */
	implicitLayout(offset) { }

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {function} [callback]
	 */
	render(layout, callback) { this.explicitLayout(layout, this.area); }

	/**
	 * Top offset in pixels
	 * @returns {Number}
	 */
	get topPixels() { return TI.PDF.inchesToPixels(this.top); }

	/**
	 * Left offset pixels
	 * @returns {Number}
	 */
	get leftPixels() { return TI.PDF.inchesToPixels(this.left); }

	/**
	 * Width in pixels
	 * @returns {Number}
	 */
	get widthPixels() { return TI.PDF.inchesToPixels(this.width); }

	/**
	 * Height in pixels
	 * @returns {Number}
	 */
	get heightPixels() { return TI.PDF.inchesToPixels(this.height); }

	/**
	 * Set height in pixels
	 * @param {Number} p
	 */
	set heightPixels(p) { this.height = TI.PDF.pixelsToInches(p); }

	/**
	 * Calculate left offset to center within width
	 * @param {Number} [width]
	 */
	center(width) {
		if (isNaN(this.width)) {
			this.alignContent = TI.PDF.Align.Center;
		} else {
			this.left = (width - this.width) / 2;
		}
	}
}

module.exports = PDFElement;