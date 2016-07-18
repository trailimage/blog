'use strict';

const { thing, Type } = require('./');

// http://schema.org/Action
module.exports = thing.extend(Type.action, {
	agent: null,
	participant: null,
	startTime: null,
	endTime: null,
	target: null
});