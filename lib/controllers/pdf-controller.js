'use strict';

const TI = require('../');
const library = TI.Library.current;
const db = TI.active;
const PDFDocument = require('pdfkit');
const fs = require('fs');
const http = require('http');


const library = require('../models/library.js').current;
const format = require('../format.js');
const config = require('../config.js');
const db = config.provider;
const Book = require('../pdf/pdf-book.js');
const Page = require('../pdf/pdf-page.js');
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
 * @returns {PDFPage}
 */
function makePhotoPage(photo, number) {
	const PhotoWell = require('../pdf/elements/photo-well.js');
	const PhotoCaption = require('../pdf/elements/photo-caption.js');
	let p = new Page('photoPage', number);
	let w = new PhotoWell();
	let c = new PhotoCaption(photo.description);

	w.addImage(photo.size.normal);
	w.addText(photo.title);

	if (w.image.isPortrait) {
		// image and caption are side-by-side
		w.style = 'photoWellLeft';
		c.style = 'captionRight';
	} else {
		// image and capton are stacked
		w.style = 'photoWellTop';
		c.style = 'captionBottom';
	}
	p.add(w);
	p.add(c);

	return p;
}