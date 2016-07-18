'use strict';

const { thing } = require('./');

// http://schema.org/GeoShape
module.exports = thing.extend('GeoShape', {
	// two points separated by a space character
	box: null,
   // a pair followed by a radius in meters
	circle: null,
   // series of two or more point objects separated by space
	line: null,
   // a series of four or more space delimited points where the first and final points are identical
	polygon: null,
   // https://en.wikipedia.org/wiki/World_Geodetic_System
	elevation: null
});