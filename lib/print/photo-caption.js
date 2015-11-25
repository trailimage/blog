'use strict';

const ElementGroup = require('./element-group.js');

/**
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PhotoCaption extends ElementGroup {
	constructor(text) {
		super();
		// parse text into paragraphs, quotes and footnotes
		this.body = this.addText(text);
	}

	/**
	 * @param {PDFDocument} pdf
	 */
	calculateHeight(pdf) {
		return this.body.calculateHeight(pdf);
	}
}

module.exports = PhotoCaption;