'use strict';

const { thing, Type } = require('./');

// http://schema.org/ImageObject
module.exports = thing.extend(Type.image, {
	caption: null,
	thumbnail: null,
	representativeOfPage: null
});