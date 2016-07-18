'use strict';

const { thing, Type } = require('./');

// http://schema.org/Service
module.exports = thing.extend(Type.service, {
	serviceType: null,
	aggregateRating: null,
	areaServed: null,
	provider: null,
	review: null
});