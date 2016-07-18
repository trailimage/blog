'use strict';

const { thing, Type } = require('./');

// http://schema.org/Rating
module.exports = thing.extend(Type.rating, {
	ratingValue: null,
	bestRating: null,
	worstRating: null
});