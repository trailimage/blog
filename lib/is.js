'use strict';

// supported type typeof() checks
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
const type = {
	UNDEFINED: 'undefined',
	BOOLEAN: 'boolean',
	NUMBER: 'number',
	STRING: 'string',
	SYMBOL: 'symbol',
	FUNCTION: 'function',
	OBJECT: 'object'
};
// check if value is defined and non-null
const value = v => v !== undefined && v !== null;
const number = n => value(n) && typeof(n) === type.NUMBER;
/**
 * Whether value is numeric even if its type is a string
 */
const numeric = n => integer(n) || /^\d$/.test(n);
const integer = n => number(n) && parseInt(n) === n;
const bigInt = n => integer(n) && (n < -32768 || n > 32767);

module.exports = {
	type,
	value,
   // http://jsperf.com/hasownproperty-vs-in-vs-other/16
	defined(object, field) { return value(object) && typeof(object[field]) !== type.UNDEFINED; },
   number,
   numeric,
   integer,
   bigInt,
   int64: bigInt,
	date(v) { value(v) && v instanceof Date; },
	empty(t) { return (!value(t)) || t === ""; },
	array(v) { return value(v) && v instanceof Array; },
	callable(v) { return value(v) && v instanceof Function; },
	text(v) { return typeof(v) === type.STRING; },
	xml(v) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
};