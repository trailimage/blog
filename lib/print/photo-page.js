'use strict';

const PrintPage = require('./print-page.js');
const PrintCaption = require('./print-caption.js');
const ImageElement = require('./image-element.js');

class PhotoPage extends PrintPage {
	/**
	 * @param {Number} number
	 */
	constructor(number) {
		super(number);

		/** @type {ImageElement} */
		this.image = new ImageElement();
		/** @type {PrintCaption} */
		this.caption = null;
		/** @type {Photo} */
		this.photo = null;
	}

	/**
	 * @param {Photo} photo
	 * @param {Number} [number]
	 * @return {PhotoPage}
	 */
	static fromPhoto(photo, number) {
		let p = new PhotoPage(number);

		p.height = book.height;
		p.width = book.width;
		p.image.original = photo.size.normal;
		p.image.title = photo.title;
		p.caption = new PrintCaption(photo.description);

		if (p.image.isPortrait) {
			p.image.fitBeside(p.caption);
		} else {
			p.image.fitAbove(p.caption);
		}
		return p;
	}
}

module.exports = PhotoPage;