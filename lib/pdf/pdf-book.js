'use strict';

const TI = require('../');
const BaseElement = TI.PDF.Element.Base;
//const PhotoPage = require('./pages/photo-page.js');
//const IndexPage = require('./pages/index-page.js');

/**
 * @extends {TI.PDF.Element.Base}
 * @see https://github.com/devongovett/pdfkit
 */
class PDFBook extends BaseElement {

	constructor() {
		super();

		/** @type {TI.PDF.Page[]} */
		this.pages = [];
		/**
		 * Current page index while rendering
		 * @type {Number}
		 * @private
		 */
		this._renderIndex = 0;
	}

	/**
	 * @param {TI.PDF.Page} p
	 * @return {TI.PDF.Page}
	 */
	add(p) { this.pages.push(p); return p; }

	/**
	 * Render the book
	 * @param {TI.PDF.Layout} layout
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