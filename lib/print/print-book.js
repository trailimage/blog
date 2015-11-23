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

		/**
		 * @type {PrintPage[]}
		 */
		this.pages = [];
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

		b.width = width;
		b.height = height;

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
	 * @param {ServerResponse|PDFDocument} res
	 */
	render(res) {
		let pdf = new PDFDocument({
			size: 'letter',
			layout: 'landscape',
			margins: 0,
			info: {
				Title: post.title,
				Author: post.author
			}
		});

		for (let f in config.print.fonts) {
			pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}

		// pipe PDF directly to response if given
		if (res !== undefined) { pdf.pipe(res); }
		for (let p of this.pages) { p.render(pdf); }
		pdf.end();
	}
}

module.exports = PrintBook;