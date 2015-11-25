'use strict';

const is = require('../is.js');
const PrintElement = require('./print-element.js');
const PDFDocument = require('pdfkit');

/**
 * @extends {PrintElement}
 */
class TextElement extends PrintElement {

	constructor(text) {
		super();
		/**
		 * @type {String}
		 */
		this.font = null;
		/**
		 * @type {Number}
		 */
		this.size = 12;
		/**
		 * @type {String}
		 */
		this.color = '#000';
		/**
		 * @type {String}
		 */
		this.text = text;
		/**
		 * Instance just to measure text
		 * @type {PDFDocument}
		 * @private
		 */
		this._pdf = new PDFDocument();
	}

	configure(pdf) {
		return pdf.font(this.font).fontSize(this.size);
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

	_calculateHeight() {
		this.height = Math.ceil(this.configure(this._pdf).heightOfString(this.text, { width: this.width }));
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

TextElement.Font = {
	heading: 'heading',
	title: 'title',
	text: 'text'
};

module.exports = TextElement;