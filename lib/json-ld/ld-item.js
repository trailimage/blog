'use strict';

const { thing, Type } = require('./');

// http://schema.org/ListItem
module.exports = thing.extend(Type.listItem, {
	item: thing(),
	nextItem: null,
	previousItem: null,
	position: null
});