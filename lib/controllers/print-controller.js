'use strict';

const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const PrintBook = require('../print/print-book.js');

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);
	// ultimately get dimensions from path
	let width = 11;
	let height = 8.5;

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let book = PrintBook.fromPost(post, width, height, config.print.dpi);
			book.render(res);
		});
	} else {
		res.notFound();
	}
};