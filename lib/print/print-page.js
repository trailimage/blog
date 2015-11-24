'use strict';

const is = require('../is.js');
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
		/** @type {Number} */
		this.number = 0;
	}

	/**
	 * @param {PrintBook} book
	 * @param {Photo} photo
	 * @param {Number} [number]
	 * @return {PrintPage}
	 */
	static fromPhoto(book, photo, number) {
		let p = new PrintPage(book, photo);

		p.height = book.height;
		p.width = book.width;
		p.image.original = photo.size.normal;
		p.image.title = photo.title;
		p.caption = PrintCaption.fromText(book, photo.description);

		if (is.number(number)) { p.number = number; }

		if (p.image.isPortrait) {
			p.image.fitBeside(p.caption);
		} else {
			p.image.fitAbove(p.caption);
		}
		return p;
	}

	/**
	 * Align area to right side of page
	 * @param {PrintArea} area
	 * @param {Number} [fromRightInches]
	 * @return {PrintPage}
	 */
	alignRight(area, fromRightInches) {
		let offset = (fromRightInches === undefined) ? 0 : this.inchesToPixels(fromRightInches);
		area.left = this.width - (this.area.width + offset);
		return this;
	}

	/**
	 * Align area to bottom of page
	 * @param {PrintArea} area
	 * @param {Number} [fromBottomInches]
	 * @return {PrintPage}
	 */
	alignBottom(area, fromBottomInches) {
		let offset = (fromBottomInches === undefined) ? 0 : this.inchesToPixels(fromBottomInches);
		area.top = this.height - (this.area.height + offset);
		return this;
	}

	/**
	 * @param {ServerResponse|function} callback
	 */
	render(callback) {
		let m = 2 * this.book.textMargin;
		// page number
		this.book.pdf
			.addPage(this.book.layout)
			.font('title').fontSize(10)
			.text(this.number, this.width - m, this.height - m);

		this.image.render(()=> { this.caption.render(callback); });
	}
}

module.exports = PrintPage;