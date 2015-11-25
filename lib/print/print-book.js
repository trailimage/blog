'use strict';

const PrintElement = require('./elements/print-element.js');
const PhotoPage = require('./pages/photo-page.js');
const CoverPage = require('./pages/cover-page.js');
const CopyrightPage = require('./pages/copyright-page.js');
const IndexPage = require('./pages/index-page.js');

/**
 * @extends {PrintElement}
 * @see https://github.com/devongovett/pdfkit
 */
class PrintBook extends PrintElement {
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
	 * @param {PhotoPage|CopyrightPage|CoverPage|IndexPage} p
	 * @return {PhotoPage|CopyrightPage|CoverPage|IndexPage}
	 */
	add(p) { this.pages.push(p); return p; }

	/**
	 * @param {Post} post
	 * @return {PrintBook}
	 */
	static fromPost(post) {
		let b = new PrintBook();
		// page count
		let c = 1;

		b.add(CoverPage.fromPost(post));
		let copyright = b.add(new CopyrightPage());
		let index = new IndexPage();
		// other margins default to 0
		copyright.allMargins = 1;
		index.allMargins = 1;

		for (let p of post.photos) {
			b.add(PhotoPage.fromPhoto(p, c++));
			index.addWord(p.tags, c);
		}
		b.add(i);

		return b;
	}

	/**
	 * Render the book
	 * @param {PDFDocument} pdf
	 * @param {function} [callback]
	 */
	render(pdf, callback) {
		this.pages[this._renderIndex].render(pdf, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.pages.length) {
				callback();
			} else {
				this.render(pdf, callback);
			}
		});
	}
}

module.exports = PrintBook;