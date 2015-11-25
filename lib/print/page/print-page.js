'use strict';

const is = require('../../is.js');
const ElementGroup = require('../element-group.js');
const TextElement = require('../element/text-element.js');

/**
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PrintPage extends ElementGroup {
	/**
	 * @param {Number} [number]
	 */
	constructor(number) {
		super();

		/**
		 * @type {Number}
		 */
		this.number = (is.number(number)) ? number : 0;
	}

	/**
	 * Align area to right side of page
	 * @param {PrintElement} el
	 * @param {Number} [fromRightInches]
	 * @return {PrintPage}
	 */
	alignRight(el, fromRightInches) {
		let offset = (fromRightInches === undefined) ? 0 : this.inchesToPixels(fromRightInches);
		el.left = this.width - (this.area.width + offset);
		return this;
	}

	/**
	 * Align area to bottom of page
	 * @param {PrintElement} el
	 * @param {Number} [fromBottomInches]
	 * @return {PrintPage}
	 */
	alignBottom(el, fromBottomInches) {
		let offset = (fromBottomInches === undefined) ? 0 : this.inchesToPixels(fromBottomInches);
		el.top = this.height - (this.area.height + offset);
		return this;
	}

	/**
	 *
	 * @param {String|Number[]} size
	 * @param {String} orientation
	 */
	layout(size, orientation) {
		if (is.array(size)) {
			this.width = size[0];
			this.height = size[1];
		} else {
			let d1 = 0;
			let d2 = 0;

			switch (size) {
				case PrintPage.Size.Legal: d1 = 8.5; d2 = 14; break;
				case PrintPage.Size.Letter: d1 = 8.5; d2 = 11; break;
			}

			if (orientation == PrintPage.Layout.Portrait) {
				this.width = d1;
				this.height = d2;
			} else {
				this.width = d2;
				this.height = d1;
			}
		}
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		// add page number above other elements
		if (this.number > 0) {
			let pn = new TextElement(this.number);
			pn.size = 10;
			pn.font = TextElement.Font.Title;
			this.add(pn);
		}
		super.render(this.configure(pdf), callback);
	}
}

PrintPage.Layout = {
	Landscape: 'landscape',
	Portrait: 'portrait'
};

PrintPage.Size = {
	Letter: 'letter',
	Legal: 'legal'
};

module.exports = PrintPage;