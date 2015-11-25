'use strict';

const PrintPage = require('./print-page.js');
const PhotoWell = require('../photo-well.js');
const PhotoCaption = require('../photo-caption.js');

class PhotoPage extends PrintPage {
	/**
	 * @param {Number} number
	 */
	constructor(number) {
		super(number);

		/** @type {PhotoWell} */
		this.well = null;
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

		p.well = p.add(PhotoWell.fromPhoto(photo));
		p.caption = p.add(new PhotoCaption(photo.description));

		return p;
	}

	onResize() {
		if (this.well.image.isPortrait) {
			this.well.fitBeside(this.caption, this.size);
		} else {
			this.well.fitAbove(this.caption, this.size);
		}
	}
}

module.exports = PhotoPage;