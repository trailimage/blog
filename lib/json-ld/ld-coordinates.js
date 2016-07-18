'use strict';

const { thing } = require('./');

// http://schema.org/GeoCoordinates
module.exports = thing.extend('GeoCoordinates', {
	// https://en.wikipedia.org/wiki/World_Geodetic_System
	elevation: null,
	latitude: null,
	longitude: null,
	postalCode: null
});