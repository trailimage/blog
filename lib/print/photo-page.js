'use strict';

const PrintPage = require('./print-page.js');
const PhotoWell = require('./photo-well.js');
const PhotoCaption = require('./photo-caption.js');

class PhotoPage extends PrintPage {
	/**
	 * @param {Number} number
	 */
	constructor(number) {
		super(number);

		/** @type {PhotoCaption} */
		this.caption = null;
		/** @type {PhotoWell} */
		this.well = null;
	}

	/**
	 * @param {Photo} photo
	 * @param {Number} [number]
	 * @return {PhotoPage}
	 */
	static fromPhoto(photo, number) {
		let p = new PhotoPage(number);

		p.well = p.add(PhotoWell.fromPhoto(photo));
		p.caption = p.add(new PhotoCaption(photo.description));

		if (p.well.image.isPortrait) {
			p.well.fitBeside(p.caption);
		} else {
			p.well.fitAbove(p.caption);
		}
		return p;
	}
}

module.exports = PhotoPage;