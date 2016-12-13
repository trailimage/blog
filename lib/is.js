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
const numeric = n => integer(n) || /^\d+$/.test(n);
const integer = n => number(n) && parseInt(n) === n;
const bigInt = n => integer(n) && (n < -32768 || n > 32767);
// http://jsperf.com/hasownproperty-vs-in-vs-other/16
const defined = (object, field) => value(object) && typeof(object[field]) !== type.UNDEFINED;

module.exports = {
   type,
   value,
   defined,
   cacheItem: o => (value(o) && defined(o, 'buffer') && defined(o, 'eTag')),
   number,
   numeric,
   integer,
   bigInt,
   int64: bigInt,
   date: v => value(v) && v instanceof Date,
   empty: t => !value(t) || t === '',
   array: v => value(v) && v instanceof Array,
   callable: v => value(v) && v instanceof Function,
   text: v => typeof(v) === type.STRING,
   xml(v) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
};