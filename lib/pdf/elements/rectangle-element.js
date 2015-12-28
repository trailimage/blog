'use strict';

const TI = require('../../');
const ShapeElement = TI.PDF.Element.Shape;

/**
 * @namespace TI.PDF.Element.Rectangle
 * @extends TI.PDF.Element.Shape
 */
class RectangleElement extends ShapeElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'rectangle' : style);
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {function} callback
	 */
	render(layout, callback) {
		let p = this.area.pixels;
		layout.pdf.rect(p.left, p.top, p.width, p.height).fillColor(this.color, this.opacity).fill();
		callback();
	}
}

module.exports = RectangleElement;