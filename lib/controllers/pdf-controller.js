'use strict';

const library = require('../models/library.js').current;
const format = require('../format.js');
const config = require('../config.js');
const db = config.provider;
const Book = require('../pdf/pdf-book.js');
const Page = require('../pdf/pages/pdf-page.js');
const PhotoPage = require('../pdf/pages/photo-page.js');
const Layout = require('../pdf/pdf-layout.js');

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
			let layout = new Layout();

			let pageNumber = 1;

			book.add(makeCover(post));
			book.add(makeCopyrightPage(post));

			for (let p of post.photos) {
				book.add(makePhotoPage(p, pageNumber++));
				//indexPage.addWord(p.tags, c);
			}

			layout.createDocument(post.title, post.author);
			layout.pdf.pipe(res);

			book.render(layout, ()=> { layout.pdf.end() });
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
	let p = new Page('coverPage');

	p.pdfReady = true;
	p.addImage(post.thumb.size.normal, 'coverImage');
	p.add(new Rectangle('coverOverlay'));
	p.addText(post.title, 'coverTitle');
	p.addText('photo essay by ' + post.author, 'coverByLine');
	p.addText(post.dateTaken, 'coverDate');
	p.addText(post.description, 'coverSummary');

	return p;
}

/**
 * @param {Post} post
 * @returns {PDFPage}
 */
function makeCopyrightPage(post) {
	let p = new Page('copyrightPage');
	let now = new Date();
	let year = now.getFullYear();

	p.addText('© Copyright ' + year + ' ' + post.author, 'copyrightText');
	p.addText(format.date(now) + ' Edition', 'editionText');

	return p;
}

/**
 * @param {Photo} photo
 * @param {Number} number
 * @returns {PhotoPage}
 */
function makePhotoPage(photo, number) {
	let p = new PhotoPage(number);

	p.addPhoto(photo);
	p.addCaption(photo.description);

	return p;
}