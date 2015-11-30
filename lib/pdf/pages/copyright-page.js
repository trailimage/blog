'use strict';

const BasePage = require('./pdf-page.js');
const format = require('../../format.js');

/**
 * @extends {BasePage}
 */
class CopyrightPage extends BasePage {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'copyrightPage' : style);
	}

	/**
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 */
	updateLayout(style, pdf) {
		let now = new Date();
		let year = now.getFullYear();

		super.updateLayout(style, pdf);

		this.addText('© Copyright ' + year + ' ' + pdf.info.author, 'copyrightText');
		this.addText(format.date(now) + ' Edition', 'editionText');
	}
}

module.exports = CopyrightPage;