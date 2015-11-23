'use strict';

const config = require('../config.js');
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
		this.textMargin = config.print.textMargin;
		/** @type {Number} */
		this.dpi = config.print.dpi;
	}

	/**
	 * @param {PrintPage} p
	 */
	addPage(p) {
		this.pages.push(p);
	}

	/**
	 * @param {Post} post
	 * @param {Number} width
	 * @param {Number} height
	 * @return {PrintBook}
	 */
	static fromPost(post, width, height) {
		let b = new PrintBook();

		b.title = post.title;
		b.author = post.author;
		b.storyDate = post.dateTaken;
		b.width = width;
		b.height = height;
		b.pdf = new PDFDocument({
			size: 'letter',
			layout: (this.width > this.height) ? 'landscape' : 'portrait',
			margins: 0,
			info: {
				Title: this.title,
				Author: this.author
			}
		});

		for (let f in config.print.fonts) {
			b.pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}

		for (let p of post.photos) {
			b.addPage(PrintPage.fromPhoto(b, p));
		}
		return b;
	}

	/**
	 * @returns {number}
	 */
	get textMarginPixels() { return this.inchesToPixels(this.textMargin); }

	/**
	 * @param {ServerResponse} [res]
	 */
	render(res) {
		// pipe PDF directly to response if given
		if (res !== undefined) { this.pdf.pipe(res); }

		this._renderCoverPage();
		this._renderCopyrightPage();

		for (let b of this._preparePhotoPages()) {

		}

		this._renderAboutPage();

		this.pdf.end();
	}

	renderImage(buffer, image) {
		this.pdf.image(buffer, { fit: [image.pixelWidth, image.pixelHeight] });
	}

	_preparePhotoPages() {
		for (let p of this.pages) {
			p.loadImage(function*(buffer) {
				yield buffer;
			});
		}
	}

	_renderCoverPage(post) {
		this.pdf.moveDown(2);
		this.pdf.font('heading').fontSize(40).text(this.title, { align: 'center' });
		this.pdf.moveDown(1);
		this.pdf.font('title').fontSize(15).text('by ' + this.author, { align: 'center' });
		this.pdf.text(this.storyDate, { align: 'center' });
	}

	_renderCopyrightPage() {

	}

	_renderAboutPage() {

	}
}

module.exports = PrintBook;

// - Private static members ---------------------------------------------------

const font = {
	heading: 'heading',
	title: 'title',
	text: 'text'
};