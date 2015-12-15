'use strict';

const TI = require('../../');
const ElementBase = TI.PDF.Element.Base;

/**
 * @alias TI.PDF.Element.Group
 * @extends ElementBase
 */
class ElementGroup extends ElementBase {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super(style);
		/**
		 * Child elements
		 * @type ElementBase[]
		 */
		this.elements = [];

		/**
		 * Current element index while rendering
		 * @type Number
		 * @private
		 */
		this._renderIndex = 0;
	}

	/**
	 * Apply styles and PDF settings to elements
	 * @param {TI.PDF.Layout} layout
	 * @param {TI.PDF.Element.Area} [container] Container area
	 */
	explicitLayout(layout, container) {
		super.explicitLayout(layout, container);

		for (let el of this.elements) {
			el.explicitLayout(layout, this.area);
		}
	}

	/**
	 * Update element positions based on their area
	 * @param {TI.PDF.Element.Area} [container]
	 */
	implicitLayout(container) {
		//if (isNaN(this.width)) { this._deriveSize('width', 'left'); }
		//if (isNaN(this.height)) { this._deriveSize('height', 'top'); }

		for (let el of this.elements) {
			el.implicitLayout(this.area);
			//el.scale(this.area);
			//el.positionWithin(this.area, this.align);
			//if (center) { el.center(this.width); }
		}
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
	 * @param {TI.PDF.Element.Text|TI.PDF.Element.Image|TI.PDF.Element.Group} el
	 * @returns {TI.PDF.Element.Text|TI.PDF.Element.Image|TI.PDF.Element.Group}
	 */
	add(el) { this.elements.push(el); return el; }

	/**
	 * Remove all child elements
	 * @return {ElementGroup|TI.PDF.Element.Group}
	 */
	empty() {
		this.elements = [];
		return this;
	}

	/**
	 * @param {TI.PhotoSize} original Image defined by Photo PhotoSize
	 * @param {String} [style]
	 * @returns {TI.PDF.Element.Image}
	 */
	addImage(original, style) {
		let img = new TI.PDF.Element.Image(style);
		img.original = original;
		return this.add(img);
	}

	/**
	 * @param {String|Number} text
	 * @param {String} [style] pdf-style.json rule
	 * @returns {TI.PDF.Element.Text}
	 */
	addText(text, style) {
		return this.add(new TI.PDF.Element.Text(text, style));
	}

	/**
	 * Render all elements in group
	 * @param {TI.PDF.Layout} layout
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
	 * @param {TI.PDF.Layout} layout
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