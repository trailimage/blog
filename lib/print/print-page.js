'use strict';

const is = require('../is.js');
const PrintElement = require('./print-element.js');
const PrintImage = require('./image-element.js');
const PrintCaption = require('./print-caption.js');

/**
 * @extends {PrintElement}
 */
class PrintPage extends PrintElement {
	constructor(number) {
		super();

		/** @type {Number} */
		this.number = (is.number(number)) ? number : 0;
	}

	/**
	 * Apply element settings to PDF
	 * @param {PDFDocument} pdf
	 * @return {PDFDocument}
	 */
	configure(pdf) {
		return pdf.addPage(this.book.layout);
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
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let m = 2 * this.book.textMargin;
		// page number
		this.configure(pdf)
			.font('title').fontSize(10)
			.text(this.number, this.width - m, this.height - m);

		this.image.render(pdf, ()=> { this.caption.render(pdf, callback); });
	}
}

PrintPage.Layout = {
	Landscape: 'landscape',
	Portrait: 'portrait'
};

module.exports = PrintPage;