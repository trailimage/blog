'use strict';

const { thing, Type } = require('./');

// http://schema.org/OwnershipInfo
module.exports = thing.extend(Type.ownership, {
	acquiredFrom: null,
	ownedFrom: null,
   ownedThrough: null,
	typeOfGood: null
});