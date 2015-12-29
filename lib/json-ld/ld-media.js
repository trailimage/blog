'use strict';

const TI = require('../');
const BaseSchema = TI.LinkData.Base;

/**
 * @extends TI.LinkData.Base
 * @alias TI.LinkData.Media
 * @see http://schema.org/MediaObject
 */

class MediaSchema extends BaseSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.media; }

		super(type);

		/** @type TI.LinkData.NewsArticle */
		this.associatedArticle = null;
		/** @type String */
		this.caption = null;
		/** @type String */
		this.contentUrl = null;
		/** @type TI.LinkData.Duration */
		this.duration = null;
		/** @type Number */
		this.height = 0;
		/** @type Number */
		this.width = 0;
	}
}


module.exports = MediaSchema;