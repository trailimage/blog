'use strict';

const BasePage = require('./pdf-page.js');
const PhotoWell = require('../photo-well.js');
const PhotoCaption = require('../photo-caption.js');

class PhotoPage extends BasePage {
	/**
	 * @param {Number} number
	 */
	constructor(number) {
		super(number);

		/** @type {PhotoWell} */
		this.photoWell = null;
		/** @type {PhotoCaption} */
		this.caption = null;
		/**
		 * Default style rule to use in pdf-style.json
		 * @type {String}
		 */
		this.style = "photoPage";
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

		return p;
	}

	/**
	 * @param {PDFStyle} style
	 * @param {PDFDocument} pdf
	 */
	updateLayout(style, pdf) {
		super.updateLayout(style, pdf);

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

		//if (this.image.left > 0) {
			// add background to fill marginal space
			//let rect = this.add(new RectangleElement(this.size));
			//rect.zIndex = 1;
			//// position image above background
			//this.image.zIndex = 10;
		//}
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

		c.left = p.width + c.margin.left + c.margin.right;
		//c.width = this.width - (well.width + (3 * this.book.textMargin));
		c.calculateHeight(pdf);
		// center vertically
		c.top = Math.round((this.height - c.height) / 2);
	}
}

module.exports = PhotoPage;