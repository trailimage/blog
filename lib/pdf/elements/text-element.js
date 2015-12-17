'use strict';

const TI = require('../../');
const is = TI.is;
const ElementBase = TI.PDF.Element.Base;

/**
 * @alias TI.PDF.Element.Text
 * @extends ElementBase
 */
class TextElement extends ElementBase {
	/**
	 * @param {String|Number} text
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(text, style) {
		super((style === undefined) ? 'defaultText' : style);
		/** @type String */
		this.font = null;
		/** @type Number */
		this.fontSize = 12;
		/** @type String */
		this.text = text;
		/** @type Number */
		this.indent = 0;
	}

	/**
	 * Whether caption is empty
	 * @returns {Boolean}
	 */
	get empty() { return is.empty(this.text); }

	/**
	 * Height of string wrapped to width
	 * Calculator deals with PDF points (72 DPI) or pixels
	 * @param {TI.PDF.Layout} layout
	 * @return {Number}
	 */
	calculateHeight(layout) {
		this.heightPixels = layout.pdf
			.font(this.font).fontSize(this.fontSize)
			.heightOfString(this.text, { width: this.widthPixels });

		return this.height;
	}

	/**
	 * Width of string
	 * Calculator deals with PDF points (72 DPI) or pixels
	 * @param {TI.PDF.Layout} layout
	 * @return {Number}
	 */
	calculateWidth(layout) {
		this.widthPixels = layout.pdf
			.font(this.font).fontSize(this.fontSize)
			.widthOfString(this.text);

		return this.width;
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {function} callback
	 */
	render(layout, callback) {
		this.explicitLayout(layout, this.area);

		let p = this.area.pixels;
		let pdf = layout.pdf;
		let options = { align: this.align.horizontal };
		let addTop = 0;
		let addBottom = 0;

		if (!isNaN(p.width)) { options.width = p.width; }

		pdf.font(this.font).fontSize(this.fontSize).fillColor(this.color, this.opacity);

		if (isNaN(p.left) && isNaN(p.top)) {
			// relative position
			pdf.text(this.text, options);
		} else if (isNaN(p.top)) {
			pdf.text(this.text, p.left, pdf.y, options);
		} else if (isNaN(p.left)) {
			pdf.text(this.text, pdf.x, p.top, options);
		} else {
			// absolute position
			pdf.text(this.text, p.left, p.top, options);
		}
		callback();
	}

	/**
	 * Calculate top, left and height if other values are known
	 * @param {TI.PDF.Element.Area} container
	 * @param {TI.PDF.Layout} [layout]
	 */
	updateSizeWithin(container, layout) {
		super.updateSizeWithin(container);
		if (isNaN(this.height) && !isNaN(this.width)) {
			this.height = this.calculateHeight(layout);
		}
	}
}

module.exports = TextElement;