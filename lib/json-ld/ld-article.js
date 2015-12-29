'use strict';

const TI = require('../');
const CreativeWorkSchema = TI.LinkData.CreativeWork;

/**
 * @extends TI.LinkData.CreativeWork
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.Article
 * @see http://schema.org/Article
 */
class ArticleSchema extends CreativeWorkSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.article; }
		super(type);

		/** @type String */
		this.articleBody = null;
		/** @type String */
		this.articleSection = null;
		/** @type String|Number */
		this.pageStart = null;
		/** @type String|Number */
		this.pageEnd = null;
		/** @type String */
		this.pagination = null;
		/** @type Number */
		this.wordCount = 0;
	}
}

module.exports = ArticleSchema;