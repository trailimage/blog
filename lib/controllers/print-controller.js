'use strict';

const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PrintBook = require('../print/print-book.js');
const PrintPage = require('../print/pages/print-page.js');
const Fonts = require('../print/elements/text-element.js').Font;
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

			for (let f in Fonts) {
				pdf.registerFont(Fonts[f], config.print.fontPath + config.print.fonts[Fonts[f]] + '.ttf');
			}

			pdf.pipe(res);
			book.render(pdf, ()=> { pdf.end() });
		});
	} else {
		res.notFound();
	}
};