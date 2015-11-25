'use strict';

const PrintPage = require('./print-page.js');

/**
 * @extends {PrintPage}
 */
class CopyrightPage extends PrintPage {
	/**
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let now = new Date();
		let year = now.getFullYear();

		this.configure(pdf)
			.font('text').fontSize(12).text('© Copyright ' + year + ' ' + this.author)
			.moveDown()
			.text(format.date(now) + ' Edition')
			.moveDown(1)
			.text('View online at http://' + config.domain + '/' + this._slug);

		callback();
	}

	onResize() {
		// update element widths
	}
}

module.exports = CopyrightPage;