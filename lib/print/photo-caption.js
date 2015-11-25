'use strict';

const ElementGroup = require('./element-group.js');

/**
 * @extends {ElementGroup}
 * @extends {PrintElement}
 */
class PhotoCaption extends ElementGroup {
	constructor(text) {
		super();
		// parse text into paragraphs, quotes and footnotes
		this.addText(text);
	}

	/**
	 * Calculate dimensions for full page width below image
	 * @param {PhotoWell} well
	 * @param {PrintSize} pageSize
	 */
	fitBelow(well, pageSize) {
		// double margin left and right
		this.left = this.margin.left;
		this.width = pageSize.width - (this.margin.left + this.margin.right);
		this.calculateHeight();
		// calculate top based on image size
		well.image.fit(pageSize.width, pageSize.height - (this.height + this.margin.top + this.margin.bottom));
		this.top = well.height + this.margin.bottom;
	}

	/**
	 * Calculate dimensions to fit beside image
	 * @param {PhotoWell} well
	 * @param {PrintSize} pageSize
	 */
	fitBeside(well, pageSize) {
		let minWidth = this.inchesToPixels(2) + this.margin.left + this.margin.right;
		// calculate left based on image size
		well.image.fit(pageSize.width - minWidth, this.book.height);
		this.left = well.width + this.book.textMargin;
		this.width = this.book.width - (well.width + (3 * this.book.textMargin));
		this.calculateHeight();
		// center vertically
		this.top = Math.round((well.height - this.height) / 2);
	}
}

module.exports = PhotoCaption;