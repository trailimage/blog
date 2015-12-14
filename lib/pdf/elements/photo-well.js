'use strict';

const TI = require('../../');
const Layout = TI.PDF.Layout;
const ElementGroup = TI.PDF.Element.Group;

/**
 * Includes image, title and optional background
 * @namespace TI.PDF.Element.PhotoWell
 * @extends TI.PDF.Element.Group
 * @extends TI.PDF.Element.Base
 */
class PhotoWell extends ElementGroup {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'photoWell' : style);

		/**
		 * @type ImageElement
		 */
		this.image = null;
		/**
		 * Photo title
		 * @type TextElement
		 */
		this.text = null;
	}

	/**
	 * @param {TI.PhotoSize} imageSize
	 * @param {String} [style]
	 * @returns {TI.PDF.Element.Image}
	 */
	addImage(imageSize, style) {
		this.image = super.addImage(imageSize, style);
		return this.image;
	}

	/**
	 * @param {String|Number} text
	 * @param {String} [style]
	 * @returns {TI.PDF.Element.Text}
	 */
	addText(text, style) {
		this.text = super.addText(text, style);
		return this.text;
	}

	/**
	 * @param {TI.PDF.Layout} layout
	 * @param {TI.PDF.Element.Area} area
	 */
	explicitLayout(layout, area) {
		this.image.fit(this.area);

		if (this.image.left > 0 && this.align === Layout.Align.Center) {
			this.image.center(this.width);
		}
	}
}

module.exports = PhotoWell;