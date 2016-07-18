'use strict';

const { thing, Type } = require('./');

// http://schema.org/Brand
module.exports = thing.extend(Type.brand, {
   aggregateRating: null,
   review: null,
   logo: null
});