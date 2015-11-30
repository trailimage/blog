'use strict';

const TextElement = require('./text-element.js');

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
