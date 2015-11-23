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

	addCoverPage(post) {
		this.pdf.moveDown(2);
		this.pdf.font('heading').fontSize(40).text(post.title, { align: 'center' });
		this.pdf.moveDown(1);
		this.pdf.font('title').fontSize(15).text('by ' + post.author, { align: 'center' });
		this.pdf.text(post.dateTaken, { align: 'center' });
	}

	addTitlePage() {

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

		b.addCoverPage();
		b.addTitlePage();

		for (let p in post.photos) {
			b.addPage(PrintPage.fromPhoto(this, p));
		}
		return b;
	}

	/**
	 * @param {Photo[]} photos
	 * @param {int} index
	 * @param {Function} callback
	 */
	_pagesFromPhotos(photos, index, callback) {
		if (index < photos.length) {
			PrintPage.fromPhoto(this, photos[index], page => {

			});
		} else {
			callback();
		}
	}

	/**
	 * @param {ServerResponse} [res]
	 */
	render(res) {
		// pipe PDF directly to response if given
		if (res !== undefined) { b.pdf.pipe(res); }
		for (let p of this.pages) { p.render(pdf); }
		b.pdf.end();
	}
}

module.exports = PrintBook;