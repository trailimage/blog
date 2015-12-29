'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @alias TI.LinkData.Blog
 * @see http://schema.org/Blog
 */
class BlogSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.blog; }
		super(type);

		/** @type TI.LinkData.BlogPost */
		this.blogPost = null;
	}
}

module.exports = BlogSchema;