'use strict';

const TI = require('../../');
const TextElement = TI.PDF.Element.Text;

/**
 * @extends {TextElement}
 */
class FootnoteElement extends TextElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'footnote' : style);
	}
}

module.exports = FootnoteElement;
