'use strict';

const PrintPage = require('./print-page.js');
const format = require('../../format.js');
const Font = require('../elements/text-element.js').Font;

/**
 * @extends {PrintPage}
 */
class CopyrightPage extends PrintPage {
	/**
	 * @param {PDFDocument} pdf
	 */
	updateLayout(pdf) {
		let now = new Date();
		let year = now.getFullYear();

		super.updateLayout(pdf);

		let copyright = this.addText('© Copyright ' + year + ' ' + pdf.info.author);
		let edition = this.addText(format.date(now) + ' Edition');

		edition.fontSize = copyright.fontSize = 14;
		copyright.margin.bottom = 0.25;
	}
}

module.exports = CopyrightPage;