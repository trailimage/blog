'use strict';

const library = require('../models/library.js').current;
const config = require('../config.js');
const db = config.provider;
const Book = require('../pdf/pdf-book.js');
const Page = require('../pdf/pages/pdf-page.js');
const Style = require('../pdf/pdf-style.js');

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type {Post} */
	let post = library.postWithSlug(req.params['slug']);

	if (post !== null) {
		db.photo.loadPost(post, post => {
			let book = new Book();
			let style = new Style();
			let pdf = style.preparePDF(post.title, post.author);

			book.add(makeCover(post));
			pdf.pipe(res);
			book.render(style, pdf, ()=> { pdf.end() });
		});
	} else {
		res.notFound();
	}
};

/**
 * @param {Post} post
 * @returns {PDFPage}
 */
function makeCover(post) {
	const Rectangle = require('../pdf/elements/rectangle-element.js');
	let c = new Page(0, 'coverPage');

	c.pdfReady = true;
	c.addImage(post.thumb.size.normal, 'coverImage');
	c.add(new Rectangle('coverOverlay'));
	c.addText(post.title, 'coverTitle');
	c.addText('by ' + post.author, 'coverByLine');
	c.addText(post.dateTaken, 'coverDate');
	c.addText(post.description, 'coverSummary');

	return c;
}

/**
 * @param {Post} post
 * @returns {PDFPage}
 */
function addCopyrightPage(post) {
	let c = new Page(0, 'copyrightPage');
	let now = new Date();
	let year = now.getFullYear();

	c.addText('© Copyright ' + year + ' ' + post.author, 'copyrightText');
	c.addText(format.date(now) + ' Edition', 'editionText');

	return c;
}