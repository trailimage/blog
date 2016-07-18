'use strict';

const { creativeWork, Type } = require('./');

// http://schema.org/Article
module.exports = creativeWork.extend(Type.article, {
	articleBody: null,
	articleSection: null,
	pageStart: null,
	pageEnd: null,
	pagination: null,
	wordCount: 0
});