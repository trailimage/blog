'use strict';

const is = require('../../is.js');
const PrintElement = require('./print-element.js');

/**
 * @extends {PrintElement}
 */
class TextElement extends PrintElement {
	/**
	 * @param {String|Number} text
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
		this.text = text;
		/**
		 * @type {Number}
		 */
		this.indent = 0;
	}

	/**
	 * Whether caption is empty
	 * @returns {Boolean}
	 */
	get empty() { return is.empty(this.text); }

	/**
	 * Height of string wrapped to width
	 */
	calculateHeight(pdf) {
		this.height = Math.ceil(pdf.heightOfString(this.text, { width: this.size.width }));
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let p = this.layoutPixels;
		pdf.font(this.font).fontSize(this.fontSize);
		pdf.text(this.text, p.left, p.top, { width: p.width });
		callback();
	}
}

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