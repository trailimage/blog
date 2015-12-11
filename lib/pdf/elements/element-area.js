'use strict';

const TI = require('../../');

class ElementArea {
	constructor() {
		this.width = NaN;
		this.height = NaN;
		/**
		 * Left edge distance from containing area
		 * @type {Number}
		 */
		this.left = NaN;
		/**
		 * Top edge distance from containing area
		 * @type {Number}
		 */
		this.top = NaN;
		/**
		 * Whether measurements are in pixels (as opposed to inches)
		 * @type {Boolean}
		 */
		this.isPixels = false;
	}

	/**
	 * Whether size is empty
	 * @returns {boolean}
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
	 * @returns {ElementArea}
	 */
	get pixels() {
		if (this.isPixels) {
			return this;
		} else {
			let a = new ElementArea();
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
	 * @returns {ElementArea}
	 */
	get inches() {
		if (this.isPixels) {
			let a = new ElementArea();
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
	 * @param {ElementArea} [a] Area to copy values to (created if none given)
	 * @returns {ElementArea}
	 */
	copy(a) {
		if (a === undefined) { a = new ElementArea(); }
		a.width = this.width;
		a.height = this.height;
		a.left = this.left;
		a.top = this.top;
		a.isPixels = this.isPixels;
		return a;
	}

	/**
	 * @param {ElementArea} area
	 * @returns {ElementArea}
	 */
	add(area) {
		if (!isNaN(area.left)) {
			this.left = (isNaN(this.left)) ? area.left : this.left + area.left;
		}
		if (!isNaN(area.top)) {
			this.top = (isNaN(this.top)) ? area.top : this.top + area.top;

		}
		return this;
	}


	/**
	 * Whether this area overlaps another
	 * @param {ElementArea} area
	 * @return {Boolean}
	 */
	overlaps(area) {
		return (area.left < this.left + this.width && area.top < this.top + this.height);
	}
}

module.exports = ElementArea;