'use strict';

const is = require('../is.js');
const ElementGroup = require('./element-group.js');
const RectangleElement = require('./element/rectangle-element.js');

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
}

module.exports = PhotoWell;