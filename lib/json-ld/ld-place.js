'use strict';

const { thing, Type } = require('./');

// http://schema.org/Place
// https://en.wikipedia.org/wiki/ISO_3166
module.exports = thing.extend(Type.place, {
	containedInPlace: null,
	containsPlace: null,
	event: null,
	logo: null,
	photo: null,
	telephone: null
});