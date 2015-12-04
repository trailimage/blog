'use strict';

const is = require('../is.js');
const ElementGroup = require('./elements/element-group.js');

/**
 * @extends {ElementGroup}
 * @extends {PDFElement}
 */
class PDFPage extends ElementGroup {
	/**
	 * @param {String} [style]
	 * @param {Number} [number]
	 */
	constructor(style, number) {
		super((style === undefined) ? 'defaultPage' : style);

		/**
		 * Number to display on page
		 * @type {Number}
		 */
		this.number = (is.number(number)) ? number : 0;
		/**
		 * Whether page has been added to PDF document
		 * @type {boolean}
		 */
		this.pdfReady = false;
	}

	/**
	 * @param {PDFLayout} layout
	 * @param {ElementArea} area
	 */
	applyStyle(layout, area) {
		// add page number if given
		if (this.number > 0) { this.addText(this.number, 'pageNumber'); }
		super.explicitLayout(layout, area);
	}

	/**
	 * Align area to right side of page
	 * @param {PDFElement} el
	 * @param {Number} [fromRightInches]
	 * @return {PDFPage}
	 */
	//alignRight(el, fromRightInches) {
	//	let offset = (fromRightInches === undefined) ? 0 : this.inchesToPixels(fromRightInches);
	//	el.left = this.width - (this.area.width + offset);
	//	return this;
	//}

	/**
	 * Align area to bottom of page
	 * @param {PDFElement} el
	 * @param {Number} [fromBottomInches]
	 * @return {PDFPage}
	 */
	//alignBottom(el, fromBottomInches) {
	//	let offset = (fromBottomInches === undefined) ? 0 : this.inchesToPixels(fromBottomInches);
	//	el.top = this.height - (this.area.height + offset);
	//	return this;
	//}

	/**
	 * @param {PDFLayout} layout
	 * @param {function} callback
	 */
	render(layout, callback) {
		if (!this.pdfReady) { layout.addPage(this); }
		super.render(layout, callback);
	}
}

module.exports = PDFPage;