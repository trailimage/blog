'use strict';

const style = require('../../pdf-style.json');

/**
 * Parse pdf-style.json
 */
class PdfStyle {
	constructor() {

	}

	/**
	 * @param {PDFDocument} pdf
	 * @returns {PdfStyle}
	 */
	static load(pdf) {
		let s = new PdfStyle();

		for (let f in style.settings.fonts) { pdf.registerFont(f, style.settings.fonts[f]); }

		return s;
	}
}