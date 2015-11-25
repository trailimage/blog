'use strict';

const PrintElement = require('./print-element.js');

/**
 * @extends {PrintElement}
 */
class PrintCaption extends PrintElement {
	constructor() {
		super();

		/**
		 * Image title
		 * @type {String}
		 */
		this.title = null;

		this.background = false;
	}

	/**
	 * Calculate dimensions for full page width below image
	 */
	belowImage(image) {
		// double margin left and right
		this.left = 2 * this.book.textMargin;
		this.width = this.book.width - (4 * this.book.textMargin);
		this._calculateHeight();
		// calculate top based on image size
		image.fit(this.book.width, this.book.height - (this.height + (3 * this.book.textMargin)));
		this.top = image.height + this.book.textMargin;
	}

	/**
	 * Calculate dimensions to fit beside image
	 * @param {ImageElement} image
	 */
	besideImage(image) {
		let minWidth = this.inchesToPixels(minWidthInches) + (3 * this.book.textMargin);
		// calculate left based on image size
		image.fit(this.book.width - minWidth, this.book.height);
		this.left = image.width + this.book.textMargin;
		this.width = this.book.width - (image.width + (3 * this.book.textMargin));
		this._calculateHeight();
		// center vertically
		this.top = Math.round((image.height - this.height) / 2);
	}

	/**
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		this.configure(pdf).text(this.text, this.left, this.top, { width: this.width });
		callback();
	}
}

module.exports = PrintCaption;