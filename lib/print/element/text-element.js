'use strict';

const is = require('../../is.js');
const PrintElement = require('./print-element.js');
const PDFDocument = require('pdfkit');

/**
 * @extends {PrintElement}
 */
class TextElement extends PrintElement {
	/**
	 * @param {String} text
	 */
	constructor(text) {
		super();
		/**
		 * @type {String}
		 */
		this.font = TextElement.Font.Text;
		/**
		 * @type {Number}
		 */
		this.fontSize = 12;
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
	}

	/**
	 * @param {PDFDocument} pdf
	 * @returns {PDFDocument}
	 */
	configure(pdf) {
		return pdf.font(this.font).fontSize(this.fontSize);
	}

	/**
	 * Whether caption is empty
	 * @returns {Boolean}
	 */
	get empty() { return is.empty(this.text); }

	/**
	 * Height of string wrapped to width
	 */
	calculateHeight() {
		this.height = Math.ceil(this.configure(TextElement.pdf).heightOfString(this.text, { width: this.size.width }));
	}

	/**
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		this.configure(pdf).text(this.text, this.left, this.top, { width: this.size.width });
		callback();
	}
}

TextElement.pdf = new PDFDocument();

/**
 * Aliases used to register PDFDocument fonts
 * @type {Object<String>}
 * @see http://pdfkit.org/docs/text.html#fonts
 */
TextElement.Font = {
	Heading: 'heading',
	Title: 'title',
	Text: 'text'
};

module.exports = TextElement;