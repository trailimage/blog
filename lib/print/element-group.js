'use strict';

const PrintElement = require('./element/print-element.js');
const ImageElement = require('./element/image-element.js');
const TextElement = require('./element/text-element.js');

/**
 * @extends {PrintElement}
 */
class ElementGroup extends PrintElement {
	/**
	 * @param {PrintSize} [size]
	 */
	constructor(size) {
		super(size);
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
	 * @param {PrintElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement} el
	 */
	add(el) { this.elements.push(el); }

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

		this.add(img);
		return img;
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
		this.add(t);
		return t;
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