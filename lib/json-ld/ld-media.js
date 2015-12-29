'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Media
 * @see http://schema.org/MediaObject
 */

class MediaSchema extends CreativeWorkSchema {
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
		/** @type Date */
		this.uploadDate = null;
	}
}


module.exports = MediaSchema;