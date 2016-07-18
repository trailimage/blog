'use strict';

const { product, Type } = require('./');

// http://schema.org/ProductModel
module.exports = product.extend(Type.productModel, {
	isVariantOf: null,
	successorOf: null,
	predecessorOf: null
});