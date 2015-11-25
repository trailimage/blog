'use strict';

const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PrintBook = require('../print/print-book.js');
const PrintPage = require('../print/pages/print-page.js');
const PDFDocument = require('pdfkit');

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
				layout: PrintPage.Layout.Landscape,
				info: {
					Title: post.title,
					Author: post.author
				}
			};
			let pdf = new PDFDocument(options);
			for (let f in config.print.fonts) {
				pdf.registerFont(f, config.print.fontPath + config.print.fonts[f] + '.ttf');
			}
			pdf.pipe(res);
			book.render(pdf, ()=> { pdf.end() });
		});
	} else {
		res.notFound();
	}
};