'use strict';

const is = require('../is.js');
const config = require('../config.js');
const format = require('../format.js');
const extend = require('extend');
const PDFDocument = require('pdfkit');
const PrintElement = require('./element/print-element.js');
const PrintPage = require('./page/print-page.js');
const PhotoPage = require('./page/photo-page.js');
const CoverPage = require('./page/cover-page.js');
const CopyrightPage = require('./page/copyright-page.js');
const IndexPage = require('./page/index-page.js');

/**
 * Wrapper for PDFKit
 * All measurements are in pixels
 * @extends {PrintElement}
 * @see https://github.com/devongovett/pdfkit
 */
class PrintBook extends PrintElement {
	constructor() {
		super();

		/** @type {PhotoPage[]} */
		this.pages = [];
		/** @type {Number} */
		this.textMargin = 0;
		/**
		 * Current page index while rendering
		 * @type {Number}
		 * @private
		 */
		this._renderIndex = 0;
	}

	configure(pdf) {
		/** @type {CoverPage} */
		let coverPage = this.pages[0];
		let options = {
			size: PrintPage.Size.Letter,
			layout: (this.size.width > this.size.height) ? PrintPage.Layout.Landscape : PrintPage.Layout.Portrait,
			info: {
				Title: coverPage.title,
				Author: coverPage.author
			}
		};
		pdf = new PDFDocument(options);
		for (let f in config.print.fonts) {
			pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}
		return pdf;
	}

	/**
	 * @param {PhotoPage|CopyrightPage|CoverPage|IndexPage} p
	 * @return {PhotoPage|CopyrightPage|CoverPage|IndexPage}
	 */
	add(p) {
		p.size = this.size;
		this.pages.push(p);
		return p;
	}

	/**
	 * @returns {Number}
	 */
	get textMarginInches() { return this.pixelsToInches(this.textMargin); }

	/**
	 * @param {Number} x
	 */
	set textMarginInches(x) { this.textMargin = this.inchesToPixels(x); }

	/**
	 * @param {Post} post
	 * @param {Number} width Inches
	 * @param {Number} height Inches
	 * @param {Number} dpi
	 * @return {PrintBook}
	 */
	static fromPost(post, width, height, dpi) {
		let b = new PrintBook();
		// page count
		let c = 1;

		b.size.dpi = dpi;
		// DPI must be set before inch-to-pixels conversions
		b.widthInches = width;
		b.heightInches = height;
		b.textMarginInches = config.print.textMargin;
		b.add(CoverPage.fromPost(post));
		b.add(new CopyrightPage());

		let i = new IndexPage();

		for (let p of post.photos) {
			b.add(PhotoPage.fromPhoto(p, c++));
			i.addWord(p.tags, c);
		}
		b.add(i);

		return b;
	}

	/**
	 * Render the book
	 * @param {ServerResponse|PDFDocument} res
	 * @param {function} [callback]
	 */
	render(res, callback) {
		let pdf = this.configure(null);

		// pipe PDF directly to response if given
		if (res !== undefined) { pdf.pipe(res); }

		this._renderNextPage(pdf, ()=> {
			pdf.end();
			if (is.callable(callback)) { callback(); }
		});
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 * @private
	 */
	_renderNextPage(pdf, callback) {
		this.pages[this._renderIndex].render(pdf, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.pages.length) {
				callback();
			} else {
				this._renderNextPage(pdf, callback);
			}
		});
	}

	_renderAboutPage() {

	}

	/**
	 * Return temportary layout with new margin
	 * @param {Number} m Inches
	 * @private
	 */
	_margin(m) {
		return extend({}, this.layout, { margin: this.inchesToPixels(m) })
	}
}

module.exports = PrintBook;