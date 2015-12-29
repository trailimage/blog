'use strict';

const TI = require('../');
const ArticleSchema = TI.LinkData.Article;

/**
 * @extends TI.LinkData.Article
 * @extends TI.LinkData.Thing
 * @alias TI.LinkData.NewsArticle
 * @see http://schema.org/NewsArticle
 */
class NewsArticleSchema extends ArticleSchema {
	constructor(type) {
		if (type === undefined) { type = TI.LinkData.Type.newsArticle; }

		super(type);

		/** @type String */
		this.dateLine = null;
		/** @type String */
		this.printColumn = null;
		/** @type String */
		this.printPage = null;
		/** @type String */
		this.printEdition = null;
		/** @type String */
		this.printSection = null;
	}
}

module.exports = NewsArticleSchema;