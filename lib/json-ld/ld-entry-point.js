'use strict';

const { thing, Type } = require('./');

// http://schema.org/EntryPoint
module.exports = thing.extend(Type.entryPoint, {
	actionApplication: null,
	actionPlatform: null,
	contentType: null,
	encodingType: null,
	httpMethod: null
});