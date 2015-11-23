'use strict';

const PrintArea = require('./print-area.js');
const PrintImage = require('./print-image.js');
const PrintCaption = require('./print-caption.js');

/**
 * @extends {PrintArea}
 */
class PrintPage extends PrintArea {
	/**
	 * @param {PrintBook} book
	 * @param {Photo} [photo]
	 */
	constructor(book, photo) {
		super(book);
		/** @type {PrintImage} */
		this.image = new PrintImage(book);
		/** @type {PrintCaption} */
		this.caption = null;
		/** @type {Photo} */
		this.photo = (photo !== undefined) ? photo : null;
	}

	/**
	 * @param {PrintBook} book
	 * @param {Photo} photo
	 * @return {PrintPage}
	 */
	static fromPhoto(book, photo) {
		let p = new PrintPage(book, photo);

		p.image.original = photo.size.normal;
		p.caption = PrintCaption.fromText(book, photo.description);

		if (p.image.isPortrait) {
			p.image.fitBeside(p.caption);
		} else {
			p.image.fitAbove(p.caption);
		}
		return p;
	}

	/**
	 * @param {ServerResponse|function} callback
	 */
	render(callback) {
		this.book.pdf.addPage();
		this.image.render(()=> { this.caption.render(callback); });
	}
}

module.exports = PrintPage;