'use strict';

const { thing, Type } = require('./');

// http://schema.org/Audience
module.exports = thing.extend(Type.audience, {
	audienceType: null,
	geographicArea: null
});