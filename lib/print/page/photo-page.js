'use strict';

const PrintPage = require('./print-page.js');
const PhotoWell = require('../photo-well.js');
const PrintElement = require('../element/print-element.js');
const PhotoCaption = require('../photo-caption.js');

class PhotoPage extends PrintPage {
	/**
	 * @param {Number} number
	 */
	constructor(number) {
		super(number);

		/** @type {PhotoWell} */
		this.photoWell = null;
		/** @type {PhotoCaption} */
		this.caption = null;
	}
	/**
	 * @param {Photo} photo
	 * @param {Number} [number] Page number
	 * @return {PhotoPage}
	 */
	static fromPhoto(photo, number) {
		let p = new PhotoPage(number);

		p.photoWell = p.add(PhotoWell.fromPhoto(photo));
		p.caption = p.add(new PhotoCaption(photo.description));
		p.caption.minWidth = 2;

		return p;
	}

	/**
	 * @param {PDFDocument} pdf
	 */
	layoutFor(pdf) {
		super.layout(pdf);

		if (this.photoWell.image.isPortrait) {
			this._sideBySideLayout(pdf);
		} else {
			this._stackLayout(pdf);
		}
	}

	/**
	 * Photo well is above caption, resized to allow room for caption
	 * @param {PDFDocument} pdf
	 * @private
	 */
	_stackLayout(pdf) {
		// double margin left and right
		caption.left = this.margin.left;
		caption.width = this.margin.left + this.margin.right;
		caption.calculateHeight(pdf);
		// calculate top based on image size
		this.photoWell.image.fit(this.width, this.height - (this.height + this.margin.top + this.margin.bottom));
		caption.top = this.photoWell.height + caption.margin.bottom;

		this.image.center();

		if (this.image.left > 0) {
			// add background to fill marginal space
			let rect = this.add(new RectangleElement(this.size));
			rect.zIndex = 1;
			// position image above background
			this.image.zIndex = 10;
		}
	}

	/**
	 * Photo well is beside caption, resized only if it doesn't allow caption minimum width
	 * @private
	 */
	_sideBySideLayout(pdf) {
		let minWidth = this.inchesToPixels(2) + this.margin.left + this.margin.right;
		// calculate left based on image size
		well.image.fit(pageSize.width - minWidth, this.book.height);
		this.left = well.width + this.book.textMargin;
		this.width = this.book.width - (well.width + (3 * this.book.textMargin));
		this.calculateHeight(pdf);
		// center vertically
		this.top = Math.round((well.height - this.height) / 2);
	}
}

module.exports = PhotoPage;