'use strict';

const TI = require('../');
const MediaSchema = TI.LinkData.Media;

/**
 * @extends TI.LinkData.Media
 * @alias TI.LinkData.Image
 * @see http://schema.org/ImageObject
 */

class ImageSchema extends MediaSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.image; }

		super(type);

		/** @type String */
		this.caption = null;
		/** @type TI.LinkData.Image*/
		this.thumbnail = null;
		/** @type ?Boolean */
		this.representativeOfPage = null;
	}
}


module.exports = ImageSchema;