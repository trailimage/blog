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
	 * Layout expected by PDFDocument
	 * @returns {Object}
	 */
	get pdfLayout() {
		return {
			size: PrintPage.Layout.Letter,
			layout: (this.width > this.height) ? PrintPage.Layout.Landscape : PrintPage.Layout.Portrait,
			margin: 0
		};
	}

	/**
	 * Apply element settings to PDF
	 * @param {PDFDocument} pdf
	 * @return {PDFDocument}
	 */
	configure(pdf) {
		return pdf.addPage(this.pdfLayout);
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
		// add page number above other elements
		if (this.number > 0) {
			let pn = new TextElement(this.number);
			pn.size = 10;
			pn.font = TextElement.Font.Title;
			this.add(pn);
		}
		super.render(this.configure(pdf), callback);
		//
		//
		//let m = 2 * this.book.textMargin;
		//// page number
		//this.configure(pdf)
		//	.font('title').fontSize(10)
		//	.text(this.number, this.width - m, this.height - m);
		//
		//this.image.render(pdf, ()=> { this.caption.render(pdf, callback); });
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