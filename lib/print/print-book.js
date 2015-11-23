'use strict';

const config = require('../config.js');
const PDFDocument = require('pdfkit');
const PrintPage = require('./print-page.js');

class PrintBook {
	constructor() {
		/**
		 * @type {PrintPage[]}
		 */
		this.pages = [];
		/**
		 * @type {PDFDocument}
		 * @private
		 */
		this.pdf = null;
	}

	finalize() {
		this.pdf.end();
	}

	/**
	 * @param {PrintPage} p
	 */
	addPage(p) {
		this.pages.push(p);
	}

	addCoverPage(post) {
		this.pdf.moveDown(2);
		this.pdf.font('heading').fontSize(40).text(post.title, {align: 'center'});
		this.pdf.moveDown(1);
		this.pdf.font('title').fontSize(15).text('by ' + post.author, {align: 'center'});
		this.pdf.text(post.dateTaken, {align: 'center'});
	}

	addTitlePage() {

	}

	/**
	 * @param {Post} post
	 * @param {ServerResponse} [res]
	 * @return {PrintBook}
	 */
	static fromPost(post, res) {
		let b = new PrintBook();
		b.pdf = new PDFDocument({
			size: 'letter',
			layout: 'landscape',
			margins: 0,
			info: {
				Title: post.title,
				Author: post.author
			}
		});

		for (let f in config.print.fonts) {
			b.pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
		}

		// pipe PDF directly to response if given
		if (res !== undefined) { b.pdf.pipe(res); }

		b.addCoverPage();
		b.addTitlePage();
		b._pagesFromPhotos(post.photos, 0, ()=> {

		});
		return b;
	}

	/**
	 * @param {Photo[]} photos
	 * @param {int} index
	 * @param {Function} callback
	 */
	_pagesFromPhotos(photos, index, callback) {
		if (index < photos.length) {
			PrintPage.fromPhoto(this.pdf, photos[index], page => {

			});
		} else {
			callback();
		}
	}
}

module.exports = PrintBook;