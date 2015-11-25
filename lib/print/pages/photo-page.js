'use strict';

const PrintPage = require('./print-page.js');
const PhotoWell = require('../photo-well.js');
const PrintElement = require('../elements/print-element.js');
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
		p.photoWell.backgroundColor = [0, 0, 0];

		return p;
	}

	/**
	 * @param {PDFDocument} pdf
	 */
	updateLayout(pdf) {
		super.updateLayout(pdf);

		if (this.photoWell.image.isPortrait) {
			this._sideBySideLayout(pdf);
		} else {
			this._stackLayout(pdf);
		}
	}

	/**
	 * Photo well is above, resized to make room for caption
	 * @param {PDFDocument} pdf
	 * @private
	 */
	_stackLayout(pdf) {
		let c = this.caption;
		let p = this.photoWell;

		// caption is aligned to left margin and takes full page width
		c.left = this.margin.left;
		c.width = this.width - (this.margin.left + this.margin.right);
		c.calculateHeight(pdf);

		p.width = this.width;
		p.height = this.height - (c.height + c.margin.top + c.margin.bottom);

		// calculate top based on image size
		c.top = p.height + c.margin.bottom;

		p.image.center(this.width);

		if (this.image.left > 0) {
			// add background to fill marginal space
			//let rect = this.add(new RectangleElement(this.size));
			//rect.zIndex = 1;
			//// position image above background
			//this.image.zIndex = 10;
		}
	}

	/**
	 * Photo well is beside caption, resized only if it doesn't allow caption minimum width
	 * @private
	 */
	_sideBySideLayout(pdf) {
		let c = this.caption;
		let p = this.photoWell;
		let minWidth = c.minWidth + c.margin.left + c.margin.right;

		// calculate left based on image size
		p.image.fit(this.width - minWidth, this.height);

		this.left = well.width + this.book.textMargin;
		this.width = this.book.width - (well.width + (3 * this.book.textMargin));
		this.calculateHeight(pdf);
		// center vertically
		this.top = Math.round((well.height - this.height) / 2);
	}
}

module.exports = PhotoPage;