'use strict';

const { thing, Type } = require('./');

// http://schema.org/MediaObject
module.exports = thing.extend(Type.media, {
	associatedArticle: null,
	caption: null,
	contentUrl: null,
	duration: null,
	height: 0,
	width: 0,
	uploadDate: null
});