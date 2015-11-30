'use strict';

const is = require('../is.js');
const ElementGroup = require('./element-group.js');
const PDFElement = require('./elements/pdf-element.js');
const RectangleElement = require('./elements/rectangle-element.js');

/**
 * Includes image, title and optional background
 * @extends {ElementGroup}
 * @extends {PDFElement}
 */
class PhotoWell extends ElementGroup {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'photoWell' : style);

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

		if (this.image.left > 0 && this.align === PDFElement.Align.Center) {
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