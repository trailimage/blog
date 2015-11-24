'use strict';

const is = require('../is.js');
const PrintArea = require('./print-area.js');
const minWidthInches = 2;

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

	/**
	 * Whether caption is empty
	 * @returns {Boolean}
	 */
	get empty() { return is.empty(this.text); }

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
	 * @param {PrintImage} image
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

	_calculateHeight() {
		this.height = Math.ceil(this.book.withTextFont().heightOfString(this.text, { width: this.width }));
	}

	/**
	 * @param {ServerResponse|function} callback
	 */
	render(callback) {
		this.book.withTextFont().text(this.text, this.left, this.top, { width: this.width });
		callback();
	}
}

module.exports = PrintCaption;