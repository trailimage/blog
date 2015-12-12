'use strict';

const TI = require('../../');
const is = TI.is;
const BaseElement = TI.PDF.Element.Base;

/**
 * @namespace TI.PDF.Element.Text
 * @extends {TI.PDF.Element.Base}
 */
class TextElement extends BaseElement {
	/**
	 * @param {String|Number} text
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(text, style) {
		super((style === undefined) ? 'defaultText' : style);
		/**
		 * @type {String}
		 */
		this.font = null;
		/**
		 * @type {Number}
		 */
		this.fontSize = 12;
		/**
		 * @type {String}
		 */
		this.text = text;
		/**
		 * @type {Number}
		 */
		this.indent = 0;
	}

	/**
	 * Whether caption is empty
	 * @returns {Boolean}
	 */
	get empty() { return is.empty(this.text); }

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {TI.PDF.Element.Area} offset
	 */
	explicitLayout(layout, offset) {
		super.explicitLayout(layout, offset);
		if (!this.empty && isNaN(this.height)) { this.calculateHeight(layout); }
	}

	/**
	 * Height of string wrapped to width
	 * Calculator deals with PDF points (72 DPI) or pixels
	 * @param {TI.PDF.Layout} layout
	 */
	calculateHeight(layout) {
		this.heightPixels = layout.pdf
			.font(this.font).fontSize(this.fontSize)
			.heightOfString(this.text, { width: this.widthPixels });
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {function} callback
	 */
	render(layout, callback) {
		this.explicitLayout(layout, this.offset);

		let p = this.offset.pixels;
		let pdf = layout.pdf;
		let options = { align: this.alignContent };
		let addTop = TI.PDF.inchesToPixels(TI.PDF.ifNaN(this.margin.top, 0));
		let addBottom = TI.PDF.inchesToPixels(TI.PDF.ifNaN(this.margin.bottom, 0));

		if (!isNaN(p.width)) { options.width = p.width; }

		pdf.font(this.font).fontSize(this.fontSize).fillColor(this.color, this.opacity);
		pdf.y += addTop;

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
		pdf.y += addBottom;

		callback();
	}
}

module.exports = TextElement;