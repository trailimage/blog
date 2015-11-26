'use strict';

const BaseElement = require('./pdf-element.js');

/**
 * @extends {BaseElement}
 */
class ShapeElement extends BaseElement {
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