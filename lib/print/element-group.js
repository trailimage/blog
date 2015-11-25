'use strict';

const PrintElement = require('./elements/print-element.js');
const ImageElement = require('./elements/image-element.js');
const TextElement = require('./elements/text-element.js');

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
	 * @param {PDFDocument} pdf
	 */
	updateLayout(pdf) {
		for (let el of this.elements) { el.updateLayout(pdf); }
	}

	/**
	 * Add child element
	 * @param {PrintElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement} el
	 * @return {PrintElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement}
	 */
	add(el) { this.elements.push(el); return el; }

	/**
	 * @param {Size} original Image defined by Photo Size
	 * @param {Number} [left]
	 * @param {Number} [top]
	 * @return {ImageElement}
	 */
	addImage(original, left, top) {
		let img = new ImageElement();

		img.original = original;
		img.position(left, top);

		return this.add(img);
	}

	/**
	 * @param {String} text
	 * @param {Number} [left]
	 * @param {Number} [top]
	 * @return {TextElement}
	 */
	addText(text, left, top) {
		let t = new TextElement(text);
		t.position(left, top);
		return this.add(t);
	}

	/**
	 * Render all elements in group
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(pdf, callback) {
		// sort by z-index
		this.updateLayout(pdf);
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