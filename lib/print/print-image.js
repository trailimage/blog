'use strict';

const PrintArea = require('./print-area.js');

/**
 * @extends {PrintArea}
 */
class PrintImage extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);
		/** @type {Size} */
		this.originalSize = null;
	}

	/**
	 * Whether image is portrait orientation
	 * @returns {Boolean}
	 */
	get isPortrait() {
		return (this.originalSize !== null && this.originalSize.height > this.originalSize.width);
	}
}

module.exports = PrintImage;