'use strict';

const TI = require('../../');
const ElementGroup = TI.PDF.Element.Group;

/**
 * @namespace TI.PDF.Element.Caption
 * @extends {TI.PDF.Element.Group}
 * @extends {TI.PDF.Element.Base}
 */
class PhotoCaption extends ElementGroup {
	/**
	 * @param {String} text
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(text, style) {
		super((style === undefined) ? 'caption' : style);
		// parse text into paragraphs, quotes and footnotes
		/** @type {TI.PDF.Element.Text} */
		this.body = this.addText(text);
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 */
	calculateHeight(layout) {
		return this.body.calculateHeight(layout);
	}
}

module.exports = PhotoCaption;