'use strict';

const config = require('../config.js');
const format = require('../format.js');
const extend = require('extend');
const PDFDocument = require('pdfkit');
const PrintElement = require('./print-element.js');
const PrintPage = require('./print-page.js');
const PhotoPage = require('./photo-page.js');
const CoverPage = require('./cover-page.js');
const IndexPage = require('./index-page.js');

/**
 * Wrapper for PDFKit
 * All measurements are in pixels
 * @extends {PrintElement}
 * @see https://github.com/devongovett/pdfkit
 */
class PrintBook extends PrintElement {
	constructor() {
		super();

		/** @type {CoverPage} */
		this.cover = null;
		/** @type {PhotoPage[]} */
		this.pages = [];
		/** @type {PDFDocument} */
		this.pdf = null;
		/** @type {Number} */
		this.textMargin = 0;
		/** @type {Number} */
		this.dpi = 72;
		/**
		 * PDFDocument configuration
		 * @type {Object}
		 */
		this.layout = {};
		/**
		 * Current page index while rendering
		 * @type {Number}
		 * @private
		 */
		this._renderIndex = 0;
		/**
		 * Path to web page
		 * @type {String}
		 * @private
		 */
		this._slug = null;

		/**
		 * Index of tags used in photos
		 * @type {IndexPage}
		 */
		this.index = new IndexPage();
	}

	/**
	 * @param {PhotoPage} p
	 */
	add(p) { this.pages.push(p); }

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

		b.widthInches = width;
		b.heightInches = height;
		b.textMarginInches = config.print.textMargin;
		b.dpi = dpi;
		b.layout = {
			size: PrintPage.Size.Letter,
			layout: (b.width > b.height) ? PrintPage.Layout.Landscape : PrintPage.Layout.Portrait,
			margin: 0,
			info: {
				Title: post.title,
				Author: post.author
			}
		};
		b._slug = post.slug;
		b.cover = CoverPage.fromPost(post);

		for (let p of post.photos) {
			b.add(PhotoPage.fromPhoto(p, c++));
			b.index.addWord(p.tags, c);
		}
		return b;
	}

	/**
	 * Render the book
	 * @param {ServerResponse|PDFDocument} res
	 * @param {function} [callback]
	 */
	render(res, callback) {
		let pdf = new PDFDocument(this.layout);

		for (let f in config.print.fonts) {
			pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}

		// pipe PDF directly to response if given
		if (res !== undefined) { pdf.pipe(res); }

		this.cover.render(pdf, ()=> {
			this._renderCopyrightPage();
			this._renderNextPhotoPage(pdf, ()=> {
				this._renderAboutPage();
				pdf.end();
			});
		});
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 * @private
	 */
	_renderNextPhotoPage(pdf, callback) {
		this.pages[this._renderIndex].render(pdf, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.pages.length) {
				callback();
			} else {
				this._renderNextPhotoPage(pdf, callback);
			}
		});
	}

	_renderCopyrightPage() {
		let now = new Date();
		let year = now.getFullYear();

		this.pdf
			.addPage(this._margin(1))
			.font('text').fontSize(12).text('© Copyright ' + year + ' ' + this.author)
			.moveDown()
			.text(format.date(now) + ' Edition')
			.moveDown(1)
			.text('View online at http://' + config.domain + '/' + this._slug);
	}

	_renderAboutPage() {
		this.pdf
			.addPage(this._margin(1))
			.font('title').fontSize(20).text('Index and About')
			.moveDown()
			.font('text').fontSize(12);

		for (let w of this.index.words) {
			this.pdf.text(w + ' ..... ' + this.index.pages(w).join(', '));
		}
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