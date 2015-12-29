'use strict';

const TI = require('../');
const ArticleSchema = TI.LinkData.Article;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Post
 * @see http://schema.org/SocialMediaPosting
 */
class PostSchema extends ArticleSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.post; }
		super(type);

		/** @type TI.LinkData.CreativeWork */
		this.sharedContent = null;
	}
}

module.exports = PostSchema;