'use strict';

const TI = require('../');
const library = TI.Library.current;
const db = TI.active;
const format = TI.format;
const Book = TI.PDF.Book;
const Layout = TI.PDF.Layout;
const Page = TI.PDF.Page;
const fs = require('fs');
const http = require('http');

/**
 * Default route action
 * @see http://pdfkit.org/docs/getting_started.html
 */
exports.view = (req, res) => {
	/** @type TI.Post */
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
				//indexPage.addWord(p.tags, C);
			}

			layout.createDocument(post.title, post.author);
			layout.pdf.pipe(res);

			book.render(layout, ()=> { layout.pdf.end() });
		});
	} else {
		res.NOT_FOUND();
	}
};

/**
 * @param {TI.Post} post
 * @returns {TI.PDF.Page}
 */
function makeCover(post) {
	const Rectangle = TI.PDF.Element.Rectangle;
	let p = new Page('coverPage');

	p.pdfReady = true;
	p.addImage(post.coverPhoto.size.normal, 'coverImage');
	p.add(new Rectangle('coverOverlay'));
	p.addText(post.title, 'coverTitle');
	p.addText('photo essay by ' + post.author, 'coverByLine');
	p.addText(post.dateTaken, 'coverDate');
	p.addText(post.description, 'coverSummary');

	return p;
}

/**
 * @param {TI.Post} post
 * @returns {TI.PDF.Page}
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
 * @param {TI.Photo} photo
 * @param {Number} number
 * @returns {TI.PDF.Page}
 */
function makePhotoPage(photo, number) {
	const PhotoWell = TI.PDF.Element.PhotoWell;
	const PhotoCaption = TI.PDF.Element.Caption;
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