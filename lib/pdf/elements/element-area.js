'use strict';

const Layout = require('../pdf-layout.js');

class ElementArea {
	constructor() {
		this.width = NaN;
		this.height = NaN;
		this.left = NaN;
		this.top = NaN;
		this.isPixels = false;
	}

	/**
	 * Whether size is empty
	 * @returns {boolean}
	 */
	get isEmpty() { return isNaN(this.width) && isNaN(this.height) && isNaN(this.left) && isNaN(this.top); }

	get toplessHeight() { return isNaN(this.top) && !isNaN(this.height); }

	/**
	 * Convert element area to pixels
	 * @returns {ElementArea}
	 */
	get pixels() {
		if (this.isPixels) {
			return this;
		} else {
			let a = new ElementArea();
			a.top = Layout.inchesToPixels(this.top);
			a.left = Layout.inchesToPixels(this.left);
			a.width = Layout.inchesToPixels(this.width);
			a.height = Layout.inchesToPixels(this.height);
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
			a.top = Layout.pixelsToInches(this.top);
			a.left = Layout.pixelsToInches(this.left);
			a.width = Layout.pixelsToInches(this.width);
			a.height = Layout.pixelsToInches(this.height);
			a.isPixels = false;

			return a;
		} else {
			return this;
		}
	}
}

module.exports = ElementArea;