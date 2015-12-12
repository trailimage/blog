'use strict';

const TI = require('../../');
const PDFElement = TI.PDF.Element.Base;

/**
 * @namespace TI.PDF.Element.Shape
 * @extends {PDFElement}
 */
class ShapeElement extends PDFElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'shape' : style);

		/**
		 * @type {String}
		 */
		this.borderColor = '#000';
		/**
		 * @type {Number}
		 */
		this.borderWidth = 0;
		/**
		 * @type {Number}
		 */
		this.opacity = 1;
	}
}

module.exports = ShapeElement;