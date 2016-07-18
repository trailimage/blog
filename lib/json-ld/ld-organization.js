'use strict';

const { thing, Type } = require('./');

// http://schema.org/Organization
module.exports = thing.extend(Type.organization, {
	logo: null,
	member: null,
	review: null,
	email: null,
	telephone: null,
	numberOfEmployees: 0,
	owns: null,
	seeks: null
});