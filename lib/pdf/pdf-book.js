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
	 * @param {PDFPage|PhotoPage|IndexPage} p
	 * @return {PDFPage|PhotoPage|IndexPage}
	 */
	add(p) { this.pages.push(p); return p; }

	/**
	 * @param {Post} post
	 * @return {PDFBook}
	 */
	static fromPost(post) {
		let b = new PDFBook();
		// page count
		let c = 1;
		let indexPage = new IndexPage();

		b.add(CoverPage.fromPost(post));
		//b.add(new CopyrightPage());
		//
		//for (let p of post.photos) {
		//	b.add(PhotoPage.fromPhoto(p, c++));
		//	indexPage.addWord(p.tags, c);
		//}
		//b.add(indexPage);

		return b;
	}

	/**
	 * Render the book
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} [callback]
	 */
	render(style, pdf, callback) {
		this.pages[this._renderIndex].render(style, pdf, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.pages.length) {
				callback();
			} else {
				this.render(style, pdf, callback);
			}
		});
	}
}

module.exports = PDFBook;