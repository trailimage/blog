'use strict';

const is = require('../../is.js');
const ShapeElement = require('./shape-element.js');

/**
 * @extends {ShapeElement}
 */
class RectangleElement extends ShapeElement {
	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		let p = this.layoutPixels;
		pdf.rect(p.left, p.top, p.width, p.height).fillColor(this.color, this.opacity);
		callback();
	}
}

module.exports = RectangleElement;