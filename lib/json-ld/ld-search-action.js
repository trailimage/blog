'use strict';

const { action, Type } = require('./');
const qi = 'query-input';

// http://schema.org/SearchAction
// https://developers.google.com/structured-data/slsb-overview
module.exports = action.extend(Type.searchAction, {
	query: null,
	[qi]: null,
	set queryInput(v) { this[qi] = v; },
	get queryInput() { return this[qi]; }
});