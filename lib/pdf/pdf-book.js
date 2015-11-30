'use strict';

const PDFElement = require('./elements/pdf-element.js');
const PhotoPage = require('./pages/photo-page.js');
const IndexPage = require('./pages/index-page.js');

/**
 * @extends {PDFElement}
 * @see https://github.com/devongovett/pdfkit
 */
class PDFBook extends PDFElement {

	constructor() {
		super();

		/** @type {PhotoPage[]} */
		this.pages = [];
		/**
		 * Current page index while rendering
		 * @type {Number}
		 * @private
		 */
		this._renderIndex = 0;
	}

	/**
	 * @param {PDFPage|PhotoPage} p
	 * @return {PDFPage|PhotoPage}
	 */
	add(p) { this.pages.push(p); return p; }

	/**
	 * Render the book
	 * @param {PDFLayout} layout
	 * @param {function} [callback]
	 */
	render(layout, callback) {
		this.pages[this._renderIndex].render(layout, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.pages.length) {
				callback();
			} else {
				this.render(layout, callback);
			}
		});
	}
}

module.exports = PDFBook;