'use strict';

const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PrintBook = require('../print/print-book.js');
const PrintPage = require('../print/page/print-page.js');

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let book = PrintBook.fromPost(post);

			let options = {
				size: PrintPage.Size.Letter,
				layout: (this.size.width > this.size.height) ? PrintPage.Layout.Landscape : PrintPage.Layout.Portrait,
				info: {
					Title: post.title,
					Author: post.author
				}
			};
			let pdf = new PDFDocument(options);
			for (let f in config.print.fonts) {
				pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
			}
			book.render(pdf, pdf.end);
		});
	} else {
		res.notFound();
	}
};