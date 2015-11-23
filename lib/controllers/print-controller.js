'use strict';

const library = require('../models/library.js').current;
const db = require('../config.js').provider;
const PrintBook = require('../print/print-book.js');
const dpi = 72;
const textMargin = 0.5;
const pageWidth = 11;
const pageHeight = 8.5;

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let book = PrintBook.fromPost(post, res);
			book.finalize();
		});
	}
};