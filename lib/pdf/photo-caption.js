'use strict';

const ElementGroup = require('./element-group.js');

/**
 * @extends {ElementGroup}
 * @extends {PDFElement}
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
	 * @param {PDFLayout} layout
	 */
	calculateHeight(layout) {
		return this.body.calculateHeight(layout);
	}
}

module.exports = PhotoCaption;