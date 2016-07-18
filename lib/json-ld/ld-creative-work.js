'use strict';

const { thing, Type } = require('./');

// http://schema.org/CreativeWork
module.exports = thing.extend(Type.creativeWork, {
	author: null,
	creator: null,
	provider: null,
	producer: null,
	sourceOrganization: null,
	editor: null,
	associatedArticle: null,
	requiresSubscription: null,
	contentSize: null,
	contentUrl: null,
	encodingFormat: null,
	bitrate: null,
	duration: null,
	height: 0,
	width: 0,
	productionCompany: null,
	regionsAllowed: null,
	copyrightHolder: null,
	copyrightYear: 0,
	audience: null,
	encoding: null,
	hasPart: null,
	isPartOf: null,
	headline: null,
   // comma-delimited
	keywords: null,
	locationCreated: null,
	review: null,
   // http://en.wikipedia.org/wiki/ISO_8601
	datePublished: null,
	text: null,
	version: 0,
   // primary entity described in some page or other CreativeWork
	mainEntity: null,
	thumbnailUrl: null
});
