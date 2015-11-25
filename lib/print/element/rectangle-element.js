'use strict';

const ShapeElement = require('./shape-element.js');

/**
 * @extends {ShapeElement}
 */
class RectangleElement extends ShapeElement {
	/**
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		pdf.rect(this.left, this.top, this.size.width, this.size.height).fill(this.color);
		callback();
	}
}

module.exports = RectangleElement;