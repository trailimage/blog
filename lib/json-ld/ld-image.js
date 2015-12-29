'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Image
 * @see http://schema.org/ImageObject
 */

class ImageSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.image; }

		super(type);

		/** @type String */
		this.caption = null;
		/** @type TI.LinkData.Image */
		this.thumbnail = null;
		/** @type Boolean */
		this.representativeOfPage = false;
	}
}


module.exports = ImageSchema;