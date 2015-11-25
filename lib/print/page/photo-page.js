'use strict';

const PrintPage = require('./print-page.js');
const PhotoWell = require('../photo-well.js');
const PhotoCaption = require('../photo-caption.js');

class PhotoPage extends PrintPage {
	/**
	 * @param {Photo} photo
	 * @param {PrintSize} size
	 * @param {Number} [number]
	 * @return {PhotoPage}
	 */
	static fromPhoto(photo, size, number) {
		let p = new PhotoPage(size, number);
		let well = p.add(PhotoWell.fromPhoto(photo));
		let caption = p.add(new PhotoCaption(photo.description));

		// initially have well fill page
		well.size = this.size.copy();

		if (well.image.isPortrait) {
			well.fitBeside(caption);
		} else {
			well.fitAbove(caption);
		}
		return p;
	}
}

module.exports = PhotoPage;