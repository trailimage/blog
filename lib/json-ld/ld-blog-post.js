'use strict';

const TI = require('../');
const PostSchema = TI.LinkData.Post;

/**
 * @extends TI.LinkData.Post
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.BlogPost
 * @see http://schema.org/BlogPosting
 */
class BlogPostSchema extends PostSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.blogPost; }
		super(type);
	}
}

module.exports = BlogPostSchema;