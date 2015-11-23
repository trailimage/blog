'use strict';

const PrintArea = require('./print-area.js');

/**
 * @extends {PrintArea}
 */
class PrintCaption extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);

		/**
		 * @type {PrintFootnotes}
		 */
		this.footnotes = null;
	}

	/**
	 * @param {PrintBook} book
	 * @param {String} text
	 * @returns {PrintCaption}
	 */
	static fromText(book, text) {
		let c = new PrintCaption(book);

		return c;
	}
}

module.exports = PrintCaption;