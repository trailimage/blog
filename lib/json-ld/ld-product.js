'use strict';

const { thing, Type } = require('./');

// http://schema.org/Product
module.exports = thing.extend(Type.product, {
	productID: null,
	sku: null,
	aggregateRating: null,
	audience: null,
	brand: null,
	color: null,
	depth: 0,
	height: 0,
	width: 0,
	review: null,
	isConsumableFor: null,
	isRelatedTo: null,
	isSimilarTo: null,
	logo: null,
	manufacturer: null,
	model: null
});