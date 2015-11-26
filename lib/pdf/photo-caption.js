'use strict';

const ElementGroup = require('./element-group.js');

/**
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PhotoCaption extends ElementGroup {
	/**
	 * @param {String} text
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(text, style) {
		super((style === undefined) ? 'caption' : style);
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