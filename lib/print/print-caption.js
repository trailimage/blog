'use strict';

const PrintArea = require('./print-area.js');

/**
 * @extends {PrintArea}
 */
class PrintCaption extends PrintArea {
	/**
	 * @param {PrintBook} book
	 */
	constructor(book) {
		super(book);

		/** @type {String} */
		this.text = null;
		/** @type {PrintFootnotes} */
		this.footnotes = null;
	}

	/**
	 * @param {PrintBook} book
	 * @param {String} text
	 * @returns {PrintCaption}
	 */
	static fromText(book, text) {
		let c = new PrintCaption(book);
		c.text = text;
		return c;
	}

	get empty() { return is.empty(this.text); }

	/**
	 * Calculate dimensions for full page width
	 */
	fullWidth() {
		this.width = this.book.width - (2 * this.book.textMargin);
		this._calculateHeight();
	}

	/**
	 * Calculate dimensions to fit beside image
	 * @param {PrintImage} image
	 */
	besideImage(image) {
		let minTextWidth = 2 + this.book.textMargin;
		let maxImageWidth = this.book.width - minTextWidth;
		let maxImageHeight = this.book.height;
		let originalWidth = this.pixelsToInches(image.original.width);
		let originalHeight = this.pixelsToInches(image.original.height);
		let widthRatio = originalWidth / maxImageWidth;
		let heightRatio = originalHeight / maxImageHeight;

		if (widthRatio > heightRatio) {
			// image width will shrink allowing more room for text
			this.width = minTextWidth;
		} else {
			// width will reduce more than height
			this.width = minTextWidth;
		}
		this._calculateHeight();
	}

	_calculateHeight() {
		let margin = this.book.textMarginPixels;
		this.height = this.book.pdf.heightOfString(this.text, { width: this.pixelWidth }) + margin;
	}

	render() {
		let margin = this.inchesToPixels(this.book.textMargin);
		this.book.pdf.text(this.text, margin, null, { width: this.pixelWidth });
	}
}

module.exports = PrintCaption;