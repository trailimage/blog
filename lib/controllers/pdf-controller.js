'use strict';

const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const Book = require('../pdf/pdf-book.js');
const Page = require('../pdf/pages/pdf-page.js');
const PDFDocument = require('pdfkit');
const PDFStyle = require('../pdf/pdf-style.js');

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let book = Book.fromPost(post);

			let options = {
				size: Page.Size.Letter,
				layout: Page.Layout.Landscape,
				margin: 0,
				info: {
					Title: post.title,
					Author: post.author
				}
			};
			let pdf = new PDFDocument(options);
			let style = new PDFStyle(pdf);

			pdf.pipe(res);
			book.render(style, pdf, ()=> { pdf.end() });
		});
	} else {
		res.notFound();
	}
};