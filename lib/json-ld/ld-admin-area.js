'use strict';

const { thing, Type } = require('./');

// http://schema.org/AdministrativeArea
module.exports = thing.extend(Type.administrativeArea, {
	containedInPlace: null,
	containsPlace: null,
	event: null,
	logo: null,
	photo: null,
	review: null,
	telephone: null,
	aggregateRating: null,
	geo: null
});