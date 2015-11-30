'use strict';

const PDFElement = require('./elements/pdf-element.js');
const ImageElement = require('./elements/image-element.js');
const TextElement = require('./elements/text-element.js');
const Layout = require('./pdf-layout.js');

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
	 * @param {PDFLayout} layout
	 */
	updateLayout(layout) {
		if (!this.laidOut) {
			layout.applyTo(this);

			let center = (this.alignContent === Layout.Align.Center);

			for (let el of this.elements) {
				el.updateLayout(layout);
				el.scale(this.width, this.height);
				el.positionWithin(this.width, this.height);
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
	 * @param {String|Number} text
	 * @param {String} [style] pdf-style.json rule
	 * @return {TextElement}
	 */
	addText(text, style) {
		return this.add(new TextElement(text, style));
	}

	/**
	 * Render all elements in group
	 * @param {PDFLayout} layout
	 * @param {function} callback
	 */
	render(layout, callback) {
		// sort by z-index
		this.updateLayout(layout);
		//this.elements.sort((el1, el2) => el1.zIndex > el2.zIndex);
		this._renderNextElement(layout, callback);
	}

	/**
	 * Serialize element rendering
	 * @param {PDFLayout} layout
	 * @param {function} callback
	 * @private
	 */
	_renderNextElement(layout, callback) {
		this.elements[this._renderIndex].render(layout, ()=> {
			this._renderIndex++;

			if (this._renderIndex >= this.elements.length) {
				callback();
			} else {
				this._renderNextElement(layout, callback);
			}
		});
	}
}

module.exports = ElementGroup;