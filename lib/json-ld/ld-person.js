'use strict';

const { thing, Type } = require('./');

// http://schema.org/Person
module.exports = thing.extend(Type.person, {
	name: null,
	affiliation: null,
	email: null,
	follows: null,
	gender: null,
	givenName: null,
	familyName: null,
	jobTitle: null,
	worksFor: null,
	owns: null,
	parent: null,
	children: null,
	spouse: null,
	birthPlace: null,
	honorificPrefix: null,
	honorificSuffix: null,
	// URLs that identify this same person
	sameAs: null
});