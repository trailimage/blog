'use strict';

const PrintElement = require('./print-element.js');

/**
 * @extends {PrintElement}
 */
class ElementGroup extends PrintElement {
	constructor() {
		super();
		/**
		 * @type {PrintElement[]}
		 */
		this.elements = [];

		/**
		 * Current element index while rendering
		 * @type {Number}
		 * @private
		 */
		this._renderIndex = 0;
	}

	/**
	 * Add child element
	 * @param {PrintElement|TextElement|ImageElement} el
	 */
	add(el) {
		this.elements.push(el);
	}

	/**
	 * Render all elements in group
	 * @param {ServerResponse|PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		// sort by z-index
		this.elements.sort((el1, el2) => el1.zIndex > el2.zIndex);
		this._renderNextElement(pdf, callback);
	}

	/**
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 * @private
	 */
	_renderNextElement(pdf, callback) {
		this.elements[this._renderIndex].render(pdf, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.elements.length) {
				callback();
			} else {
				this._renderNextElement(pdf, callback);
			}
		});
	}
}

module.exports = ElementGroup;