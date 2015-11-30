'use strict';

const is = require('../../is.js');
const ShapeElement = require('./shape-element.js');

/**
 * @extends {ShapeElement}
 */
class RectangleElement extends ShapeElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'rectangle' : style);
	}

	/**
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(style, pdf, callback) {
		let p = this.layoutPixels;
		pdf.rect(p.left, p.top, p.width, p.height).fillColor(this.color, this.opacity).fill();
		callback();
	}
}

module.exports = RectangleElement;