'use strict';

const { rating, Type } = require('./');

// http://schema.org/AggregateRating
module.exports = rating.extend(Type.aggregateRating, {
	itemReviews: null,
	ratingCount: 0,
	reviewCount: 0
});