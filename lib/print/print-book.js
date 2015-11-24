'use strict';

const config = require('../config.js');
const format = require('../format.js');
const PDFDocument = require('pdfkit');
const PrintArea = require('./print-area.js');
const PrintPage = require('./print-page.js');

/**
 * Wrapper for PDFKit
 * @extends {PrintArea}
 * @see https://github.com/devongovett/pdfkit
 */
class PrintBook extends PrintArea {
	constructor() {
		super(null);

		/** @type {PrintPage[]} */
		this.pages = [];
		/** @type {String} */
		this.title = null;
		/** @type {String} */
		this.author = null;
		/** @type {String} */
		this.storyDate = null;
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
	}

	/**
	 * @param {PrintPage} p
	 */
	addPage(p) {
		this.pages.push(p);
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
	 * @return {PrintBook}
	 */
	static fromPost(post, width, height) {
		let b = new PrintBook();

		b.title = post.title;
		b.author = post.author;
		b.storyDate = post.dateTaken;
		b.widthInches = width;
		b.heightInches = height;
		b.textMarginInches = config.print.textMargin;
		b.layout = {
			size: 'letter',
			layout: (b.width > b.height) ? 'landscape' : 'portrait',
			margins: 0,
			info: {
				Title: b.title,
				Author: b.author
			}
		};
		// PDF instance is needed prior to rendering in order to measure text blocks to calculate layouts
		b.pdf = new PDFDocument(b.layout);
		b._slug = post.slug;

		for (let f in config.print.fonts) {
			b.pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}

		for (let p of post.photos) {
			b.addPage(PrintPage.fromPhoto(b, p));
		}
		return b;
	}

	/**
	 * Render the book
	 * @param {ServerResponse|function} [res]
	 */
	render(res) {
		// pipe PDF directly to response if given
		if (res !== undefined) { this.pdf.pipe(res); }

		this._renderCoverPage();
		this._renderCopyrightPage();
		this._renderNextPhotoPage(()=> {
			this._renderAboutPage();
			this.pdf.end();
		});
	}

	/**
	 * Set standard text font
	 * @return {PDFDocument}
	 */
	withTextFont() {
		this.pdf.font('text').fontSize(12);
		return this.pdf;
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

	_renderCoverPage(post) {
		this.pdf.moveDown(2);
		this.pdf.font('heading').fontSize(40).text(this.title, { align: 'center' });
		this.pdf.moveDown(1);
		this.pdf.font('title').fontSize(15).text('by ' + this.author, { align: 'center' });
		this.pdf.text(this.storyDate, { align: 'center' });
	}

	_renderCopyrightPage() {
		let now = new Date();
		let year = now.getFullYear();

		this.pdf.addPage();
		this.pdf.font('text').fontSize(12).text('© Copyright ' + year + ' ' + this.author);
		this.pdf.moveDown(1);
		this.pdf.text(format.date(now) + ' Edition');
		this.pdf.moveDown(2);
		this.pdf.text('View online at http://' + config.domain + '/' + this._slug);
	}

	_renderAboutPage() {
		this.pdf.addPage();
		this.pdf.font('text').fontSize(15).text('Index and About');
	}
}

module.exports = PrintBook;

// - Private static members ---------------------------------------------------

const font = {
	heading: 'heading',
	title: 'title',
	text: 'text'
};