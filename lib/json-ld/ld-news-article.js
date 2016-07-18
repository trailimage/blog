'use strict';

const { article, Type } = require('./');

// http://schema.org/NewsArticle
module.exports = article.extend(Type.newsArticle, {
	dateLine: null,
	printColumn: null,
	printPage: null,
	printEdition: null,
	printSection: null
});