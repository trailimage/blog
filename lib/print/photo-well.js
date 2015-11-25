'use strict';

const is = require('../is.js');
const ElementGroup = require('./element-group.js');

/**
 * Includes image, title and optional background
 * @extends {ElementGroup}
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
		caption.belowImage(this);
		this.center();
		this.background = (this.left > 0);
	}

	/**
	 * Adjust image dimensions to fit beside caption box
	 * @param {PhotoCaption} caption
	 */
	fitBeside(caption) {
		caption.besideImage(this);
	}
}

module.exports = PhotoWell;