'use strict';

const is = require('../../is.js');
const ElementGroup = require('../element-group.js');
const TextElement = require('../elements/text-element.js');
const Align = require('../elements/pdf-element.js').Align;

/**
 * @extends {ElementGroup}
 * @extends {PDFElement}
 */
class PDFPage extends ElementGroup {
	/**
	 * @param {Number} [number]
	 * @param {String} [style]
	 */
	constructor(number, style) {
		super((style === undefined) ? 'defaultPage' : style);

		/**
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
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 */
	updateLayout(style, pdf) {
		let size = pdf.options.size;
		let orientation = pdf.options.layout;

		if (is.array(size)) {
			this.width = size[0];
			this.height = size[1];
		} else {
			let d1 = 0;
			let d2 = 0;

			switch (size) {
				case PDFPage.Size.Legal: d1 = 8.5; d2 = 14; break;
				case PDFPage.Size.Letter: d1 = 8.5; d2 = 11; break;
			}

			if (orientation == PDFPage.Layout.Portrait) {
				this.width = d1;
				this.height = d2;
			} else {
				this.width = d2;
				this.height = d1;
			}
		}

		if (this.number > 0) {
			// add page number element
			this.add(new TextElement(this.number, 'pageNumber'));
		}

		style.applyTo(this);

		if (this.alignContent === Align.Center) {
			for (let el of this.elements) {	el.center(this.width); }
		}
	}

	/**
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(style, pdf, callback) {
		if (!this.pdfReady) {
			// create PDF page
			let margins = this.marginPixels;

			for (let dim in margins) { if (isNaN(margins[dim])) { margins[dim] = 0; } }

			pdf.addPage({
				size: pdf.options.size,
				layout: pdf.options.layout,
				margins: margins
			});
			this.pdfReady = true;
		}
		super.render(style, pdf, callback);
	}
}

PDFPage.Layout = {
	Landscape: 'landscape',
	Portrait: 'portrait'
};

PDFPage.Size = {
	Letter: 'letter',
	Legal: 'legal'
};

module.exports = PDFPage;