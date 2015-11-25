'use strict';

const is = require('../is.js');
const ElementGroup = require('./element-group.js');
const RectangleElement = require('./rectangle-element.js');

/**
 * Includes image, title and optional background
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PhotoWell extends ElementGroup {
	constructor() {
		super();

		/**
		 * @type {ImageElement}
		 */
		this.image = null;
		/**
		 * @type {TextElement}
		 */
		this.text = null;
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

	/**
	 * Adjust image dimensions to fit above caption box
	 * @param {PhotoCaption} caption
	 */
	fitAbove(caption) {
		caption.fitBelow(this);
		this.image.center();

		if (this.image.left > 0) {
			// add background to fill marginal space
			let rect = this.add(new RectangleElement());
			rect.sizeTo(this);
			rect.zIndex = 1;
			// position image above background
			this.image.zIndex = 10;
		}
	}

	/**
	 * Adjust image dimensions to fit beside caption box
	 * @param {PhotoCaption} caption
	 */
	fitBeside(caption) {
		caption.fitBeside(this);
	}
}

module.exports = PhotoWell;