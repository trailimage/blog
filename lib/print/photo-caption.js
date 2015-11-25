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
	 */
	fitBelow(well) {
		// double margin left and right
		this.left = 2 * this.book.textMargin;
		this.width = this.book.width - (4 * this.book.textMargin);
		this._calculateHeight();
		// calculate top based on image size
		well.image.fit(this.book.width, this.book.height - (this.height + (3 * this.book.textMargin)));
		this.top = well.height + this.book.textMargin;
	}

	/**
	 * Calculate dimensions to fit beside image
	 * @param {PhotoWell} well
	 */
	fitBeside(well) {
		let minWidth = this.inchesToPixels(minWidthInches) + (3 * this.book.textMargin);
		// calculate left based on image size
		well.image.fit(this.book.width - minWidth, this.book.height);
		this.left = well.width + this.book.textMargin;
		this.width = this.book.width - (well.width + (3 * this.book.textMargin));
		this._calculateHeight();
		// center vertically
		this.top = Math.round((well.height - this.height) / 2);
	}
}

module.exports = PhotoCaption;