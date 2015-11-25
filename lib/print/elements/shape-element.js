'use strict';

const PrintElement = require('./print-element.js');

/**
 * @extends {PrintElement}
 */
class ShapeElement extends PrintElement {
	constructor() {
		super();

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