'use strict';

const TI = require('../../');
const Layout = TI.PDF.Layout;
const PDFElement = TI.PDF.Element.Base;
const ImageElement = TI.PDF.Element.Image;
const TextElement = TI.PDF.Element.Text;

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
	 * Apply styles and PDF settings to elements
	 * @param {PDFLayout} layout
	 * @param {ElementArea} [area]
	 */
	explicitLayout(layout, area) {
		super.explicitLayout(layout, area);

		let center = (this.alignContent === Layout.Align.Center);

		// apply styles
		for (let el of this.elements) { el.explicitLayout(layout, this.absolute); }

		for (let el of this.elements) {
			el.scale(this.area);
			el.positionWithin(this.area);
			if (center) { el.center(this.width); }
		}
	}

	/**
	 * Update element positions based on their area
	 * @param {ElementArea} [area]
	 */
	implicitLayout(area) {
		if (isNaN(this.width)) { this._deriveSize('width', 'left'); }
		if (isNaN(this.height)) { this._deriveSize('height', 'top'); }

		for (let el of this.elements) { el.implicitLayout(this.area); }
	}

	/**
	 * Derive group size from maximimum element dimensions
	 * @param {String} dim Dimension field name (width/height)
	 * @param {String} edge Edge field name (top/left/right/bottom)
	 * @private
	 */
	_deriveSize(dim, edge) {
		// calculate size
		let max = {[dim]: NaN, [edge]: NaN};

		for (let el of this.elements) {
			if (!isNaN(el[edge])) {
				// maximum edge
				if ((isNaN(max[edge]) || (el[edge] >= 0 && el[edge] < max[edge]))) { max[edge] = el[edge]; }
				// maximum dimension
				if (!isNaN(el[dim]) && (
					(isNaN(max[dim]) || (el[edge] + el[dim] > max[dim])))) { max[dim] = el[edge] + el[dim]; }
			}
		}
		if (!isNaN(max[edge]) && !isNaN(max[dim])) { this[dim] = max[dim] - max[edge]; }
	}

	/**
	 * Add child element
	 * @param {PDFElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement} el
	 * @return {PDFElement|TextElement|ImageElement|PhotoWell|PhotoCaption|RectangleElement}
	 */
	add(el) { this.elements.push(el); return el; }

	/**
	 * @param {PhotoSize} original Image defined by Photo PhotoSize
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
		this.explicitLayout(layout, this.area);
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