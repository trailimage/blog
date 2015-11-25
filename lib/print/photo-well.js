'use strict';

const is = require('../is.js');
const ElementGroup = require('./element-group.js');
const PrintElement = require('./elements/print-element.js');
const RectangleElement = require('./elements/rectangle-element.js');

/**
 * Includes image, title and optional background
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PhotoWell extends ElementGroup {
	constructor() {
		/**
		 * @type {ImageElement}
		 */
		this.image = null;
		/**
		 * Photo title
		 * @type {TextElement}
		 */
		this.text = null;
	}

	/**
	 * @param {PDFDocument} pdf
	 */
	updateLayout(pdf) {
		this.image.fit(this.width, this.height);
		if (this.image.left > 0 && this.align === PrintElement.Align.Center) {
			this.image.center(this.width);
		}
	}

	/**
	 * @param {Photo} photo
	 * @return {PhotoWell}
	 */
	static fromPhoto(photo) {
		let p = new PhotoWell();

		p.image = p.addImage(photo.size.normal);
		p.text = p.addText(photo.title);

		return p;
	}
}

module.exports = PhotoWell;