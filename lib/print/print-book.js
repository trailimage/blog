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
		this.dpi = config.print.dpi;
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
	 * @param {PrintPage} p
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
	 * @return {PrintBook}
	 */
	static fromPost(post, width, height) {
		let b = new PrintBook();
		// page count
		let c = 1;

		b.widthInches = width;
		b.heightInches = height;
		b.textMarginInches = config.print.textMargin;
		b.layout = {
			size: 'letter',
			layout: (b.width > b.height) ? PrintPage.Layout.Landscape : PrintPage.Layout.Portrait,
			margin: 0,
			info: {
				Title: post.title,
				Author: post.author
			}
		};
		// PDF instance is needed prior to rendering in order to measure text blocks to calculate layouts
		b.pdf = new PDFDocument(b.layout);
		b._slug = post.slug;

		for (let f in config.print.fonts) {
			b.pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}

		b.cover = CoverPage.fromPost(b, post);

		for (let p of post.photos) {
			b.add(PhotoPage.fromPhoto(b, p, c++));
			b.index.addWord(p.tags, c);
		}
		return b;
	}

	/**
	 * Render the book
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} [callback]
	 */
	render(pdf, callback) {
		// pipe PDF directly to response if given
		if (res !== undefined) { this.pdf.pipe(res); }

		this.cover.render(()=> {
			this._renderCopyrightPage();
			this._renderNextPhotoPage(()=> {
				this._renderAboutPage();
				this.pdf.end();
			});
		});
	}

	/**
	 * @param {function} callback
	 * @private
	 */
	_renderNextPhotoPage(callback) {
		this.pages[this._renderIndex].render(() => {
			this._renderIndex++;

			if (this._renderIndex >= this.pages.length) {
				callback();
			} else {
				this._renderNextPhotoPage(callback);
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