'use strict';

const is = require('../../is.js');
const ElementGroup = require('./element-group.js');
const PDFElement = require('./pdf-element.js');
const RectangleElement = require('./rectangle-element.js');
const Layout = require('../pdf-layout.js');

/**
 * Includes image, title and optional background
 * @extends {ElementGroup}
 * @extends {PDFElement}
 */
class PhotoWell extends ElementGroup {
	/**
	 * @param {String} [style] pdf-style.json rule
	 */
	constructor(style) {
		super((style === undefined) ? 'photoWell' : style);

		/**
		 * @type {ImageElement}
		 */
		this.image = null;
		/**
		 * Photo title
		 * @type {TextElement}
		 */
		this.text = null;
	}

	/**
	 * @param {PhotoSize} imageSize
	 * @param {String} [style]
	 * @returns {ImageElement}
	 */
	addImage(imageSize, style) {
		this.image = super.addImage(imageSize, style);
		return this.image;
	}

	/**
	 * @param {String} text
	 * @param {String} [style]
	 * @return {TextElement}
	 */
	addText(text, style) {
		this.text = super.addText(text, style);
		return this.text;
	}

	/**
	 * @param {PDFLayout} layout
	 * @param {ElementArea} area
	 */
	applyStyle(layout, area) {
		this.image.fit(this.area);

		if (this.image.left > 0 && this.align === Layout.Align.Center) {
			this.image.center(this.width);
		}
	}
}

module.exports = PhotoWell;