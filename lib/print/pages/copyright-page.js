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
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let now = new Date();
		let year = now.getFullYear();

		pdf
			.addPage()
			.font(Font.SanSerif).fontSize(12).text('© Copyright ' + year + ' ' + this.author)
			.moveDown()
			.text(format.date(now) + ' Edition');
			//.moveDown(1)
			//.text('View online at http://' + config.domain + '/' + this._slug);

		callback();
	}
}

module.exports = CopyrightPage;