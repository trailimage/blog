'use strict';

const TI = require('../');
const MediaSchema = TI.LinkData.Media;

/**
 * @extends TI.LinkData.Media
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Image
 * @see http://schema.org/ImageObject
 */

class ImageSchema extends MediaSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.image; }

		super(type);

		/** @type String */
		this.caption = null;
		/** @type TI.LinkData.Image */
		this.thumbnail = null;
		/** @type ?Boolean */
		this.representativeOfPage = null;
	}

	/**
	 * @param {String} url
	 * @param {Number} [width]
	 * @param {Number} [height]
	 * @returns {ImageSchema|TI.LinkData.Image}
	 */
	static fromURL(url, width, height) {
		let ld = new ImageSchema();

		ld.url = url;
		if (width !== undefined) { ld.width = width; }
		if (height !== undefined) { ld.height = height; }

		return ld;
	}
}


module.exports = ImageSchema;