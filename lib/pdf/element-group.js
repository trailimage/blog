'use strict';

const PDFElement = require('./elements/pdf-element.js');
const ImageElement = require('./elements/image-element.js');
const TextElement = require('./elements/text-element.js');

/**
 * @extends {PDFElement}
 */
class ElementGroup extends PDFElement {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super(style);
		/**
		 * @type {PDFElement[]}
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
	 * @param {PDFStyle} style
	 */
	updateLayout(style) {
		if (!this.laidOut) {
			style.applyTo(this);

			let center = (this.alignContent === PDFElement.Align.Center);

			for (let el of this.elements) {
				el.updateLayout(style);
				el.scale(this.width, this.height);
				if (center) { el.center(this.width); }
			}
			this.laidOut = true;
		}
	}

	/**
	 * Add child element
	 * @param {PDFElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement} el
	 * @return {PDFElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement}
	 */
	add(el) { this.elements.push(el); return el; }

	/**
	 * @param {Size} original Image defined by Photo Size
	 * @param {String} [style]
	 * @return {ImageElement}
	 */
	addImage(original, style) {
		let img = new ImageElement(style);
		img.original = original;
		return this.add(img);
	}

	/**
	 * @param {String} text
	 * @param {String} [style] pdf-style.json rule
	 * @return {TextElement}
	 */
	addText(text, style) {
		return this.add(new TextElement(text, style));
	}

	/**
	 * Render all elements in group
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(style, pdf, callback) {
		// sort by z-index
		this.updateLayout(style);
		//this.elements.sort((el1, el2) => el1.zIndex > el2.zIndex);
		this._renderNextElement(style, pdf, callback);
	}

	/**
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 * @private
	 */
	_renderNextElement(style, pdf, callback) {
		this.elements[this._renderIndex].render(style, pdf, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.elements.length) {
				callback();
			} else {
				this._renderNextElement(style, pdf, callback);
			}
		});
	}
}

module.exports = ElementGroup;