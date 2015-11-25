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
		this.font = TextElement.Font.Text;
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
		 * @type {Number}
		 */
		this.indent = 0;
		/**
		 * Instance just to measure text
		 * @type {PDFDocument}
		 * @private
		 */
		this._pdf = new PDFDocument();
	}

	/**
	 * @param {PDFDocument} pdf
	 * @returns {PDFDocument}
	 */
	configure(pdf) {
		return pdf.font(this.font).fontSize(this.size);
	}

	/**
	 * Whether caption is empty
	 * @returns {Boolean}
	 */
	get empty() { return is.empty(this.text); }

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
	Heading: 'heading',
	Title: 'title',
	Text: 'text'
};

module.exports = TextElement;