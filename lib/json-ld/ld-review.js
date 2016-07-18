'use strict';

const { creativeWork, Type } = require('./');

// http://schema.org/Review
module.exports = creativeWork.extend(Type.review, {
	reviewBody: null,
	reviewRating: null,
	itemReviewed: null
});