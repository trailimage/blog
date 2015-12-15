'use strict';

const TI = require('../../');

/**
 * @alias TI.PDF.Element.Area
 */
class ElementArea {
	constructor() {
		this.width = NaN;
		this.height = NaN;
		/**
		 * Left edge distance from containing element
		 * @type Number
		 * @private
		 */
		this.left = NaN;
		/**
		 * Top edge distance from containing element
		 * @type Number
		 * @private
		 */
		this.top = NaN;

		/**
		 * Top edge distance from page
		 * @type Number
		 */
		this._pageTop = NaN;

		/**
		 * Left edge distance from page
		 */
		this._pageLeft = NaN;

		/**
		 * Whether measurements are in pixels (as opposed to inches)
		 * @type Boolean
		 */
		this.isPixels = false;

		/**
		 * Content alignment
		 * @type {{horizontal: string, vertical: string}}
		 */
		this.align = {
			horizontal: TI.PDF.Align.Inherit,
			vertical: TI.PDF.Align.Inherit
		};
	}

	/**
	 * Style rules indicate relative offsets
	 * @param {Number} n
	 */
	set pageLeft(n) { this._pageLeft = n; }
	/** @return {Number} */
	get pageLeft() { return this._pageLeft; }

	/**
	 * Style rules indicate relative offsets
	 * @param {Number} n
	 */
	set pageTop(n) { this._pageTop = n;	}
	/** @return {Number} */
	get pageTop() { return this._pageTop; }

	/**
	 * Whether width, height left and top are all empty
	 * @returns {Boolean}
	 */
	get isEmpty() { return isNaN(this.width) && isNaN(this.height) && isNaN(this.left) && isNaN(this.top); }

	/**
	 * Calculated bottom as opposed to PDFElement.bottom which is the bottom distance from the containing area
	 * @returns {Number}
	 */
	get bottom() { return this.top + this.height; }

	/**
	 * Calculated right edge as opposed to PDFElement.right which is the right distance from the containing area
	 * @returns {Number}
	 */
	get right() { return this.left + this.width; }

	/**
	 * Convert element area to pixels
	 * @returns {ElementArea|TI.PDF.Element.Area}
	 */
	get pixels() {
		if (this.isPixels) {
			return this;
		} else {
			let a = new ElementArea();
			a.relativeLeft = TI.PDF.inchesToPixels(this._relativeLeft);
			a.relativeTop = TI.PDF.inchesToPixels(this._relativeTop);
			a.top = TI.PDF.inchesToPixels(this.top);
			a.left = TI.PDF.inchesToPixels(this.left);
			a.width = TI.PDF.inchesToPixels(this.width);
			a.height = TI.PDF.inchesToPixels(this.height);
			a.isPixels = true;

			return a;
		}
	}

	/**
	 * Convert element area to inches
	 * @returns {ElementArea|TI.PDF.Element.Area}
	 */
	get inches() {
		if (this.isPixels) {
			let a = new ElementArea();
			a.relativeLeft = TI.PDF.pixelsToInches(this._relativeLeft);
			a.relativeTop = TI.PDF.pixelsToInches(this._relativeTop);
			a.top = TI.PDF.pixelsToInches(this.top);
			a.left = TI.PDF.pixelsToInches(this.left);
			a.width = TI.PDF.pixelsToInches(this.width);
			a.height = TI.PDF.pixelsToInches(this.height);
			a.isPixels = false;

			return a;
		} else {
			return this;
		}
	}

	/**
	 * @param {ElementArea|TI.PDF.Element.Area} [a] Offset to copy values to (created if none given)
	 * @returns {ElementArea|TI.PDF.Element.Area}
	 */
	copy(a) {
		if (a === undefined) { a = new ElementArea(); }
		a.pageLeft = this._pageLeft;
		a.pageTop = this._pageTop;
		a.width = this.width;
		a.height = this.height;
		a.left = this.left;
		a.top = this.top;
		a.isPixels = this.isPixels;
		a.align.horizontal = this.align.horizontal;
		a.align.vertical = this.align.vertical;
		return a;
	}

	/**
	 * Add left and top dimensions of container area to this area
	 * If this area hasn't defined those dimensions then they are set equal to
	 * the container values
	 * @alias TI.PDF.Element.Area.add
	 * @param {ElementArea|TI.PDF.Element.Area} other Container area
	 * @returns {ElementArea|TI.PDF.Element.Area}
	 */
	add(other) {
		if (!isNaN(other.left)) {
			// continer has left dimension
			this.left = (isNaN(this.left)) ? other.left : this.left + other.left;
		}
		if (!isNaN(other.top)) {
			// container has top dimension
			this.top = (isNaN(this.top)) ? other.top : this.top + other.top;
		}
		return this;
	}

	/**
	 * Inherit alignment from another area
	 * @param {TI.PDF.Element.Area} other
	 */
	inherit(other) {
		let h = TI.PDF.Align.Inherit;

		if (this.align.horizontal === h && other.align.horizontal !== h) {
			this.align.horizontal = other.align.horizontal;
		}

		if (this.align.vertical === h && other.align.vertical !== h) {
			this.align.vertical = other.align.vertical;
		}
	}

	/**
	 * Compute missing values
	 * @param {TI.PDF.Element.Area} container
	 * @param {Number} bottom Bottom distance from container edge
	 * @param {Number} right Right distance from container edge
	 */
	calculate(container, bottom, right) {
		if (!isNaN(right) && !isNaN(container.width)) {
			// convert distance from right into distance from left
			let rightLength = container.width - right;

			if (isNaN(this.left) && !isNaN(this.width)) {
				this.left = rightLength - this.width;
			} else if (isNaN(this.width) && !isNaN(this.left)) {
				this.width = rightLength - this.left;
			}
		}

		if (!isNaN(bottom) && !isNaN(container.height)) {
			// convert distance from bottom into distance from top
			let bottomLength = container.height - bottom;

			if (isNaN(this.top) && !isNaN(this.height)) {
				this.top = bottomLength - this.height;
			} else if (isNaN(this.height) && !isNaN(this.top)) {
				this.height - bottomLength - this.top;
			}
		}
	}

	/**
	 * Remove all measurements
	 * @returns {ElementArea|TI.PDF.Element.Area}
	 */
	reset() {
		this.width = NaN;
		this.height = NaN;
		this.left = NaN;
		this.top = NaN;
		this._relativeTop = NaN;
		this._relativeLeft = NaN;
		return this;
	}

	/**
	 * Whether this area overlaps another
	 * @param {ElementArea|TI.PDF.Element.Area} area
	 * @returns {Boolean}
	 */
	overlaps(area) {
		return (area.left < this.left + this.width && area.top < this.top + this.height);
	}
}

module.exports = ElementArea;