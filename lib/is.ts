/**
 * Javascript types
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
 */
const type = {
   UNDEFINED: 'undefined',
   BOOLEAN: 'boolean',
   NUMBER: 'number',
   STRING: 'string',
   SYMBOL: 'symbol',
   FUNCTION: 'function',
   OBJECT: 'object'
};

/**
 * Check if value is defined and non-null
 */
const value = (v:any) => (v !== undefined && v !== null);

/**
 * Whether value is a number
 */
const number = (n:any) => value(n) && typeof(n) === type.NUMBER;

/**
 * Whether value is numeric even if its type is a string
 */
const numeric = (n:any) => integer(n) || /^\d+$/.test(n);
const integer = (n:any) => number(n) && parseInt(n) === n;
const bigInt = (n:any) => integer(n) && (n < -32768 || n > 32767);
// http://jsperf.com/hasownproperty-vs-in-vs-other/16

/**
 * Whether object has a named field
 * @returns {boolean}
 */
const defined = (object:any, field:string) => value(object) && typeof(object[field]) !== type.UNDEFINED;

export default {
   type,
   value,
   defined,
   cacheItem: (o:any) => (value(o) && defined(o, 'buffer') && defined(o, 'eTag')),
   number,
   numeric,
   integer,
   bigInt,
   int64: bigInt,
   date: (v:any) => value(v) && v instanceof Date,
   empty: (t:any) => !value(t) || t === '',
   array: (v:any) => value(v) && v instanceof Array,
   callable: (v:any) => value(v) && v instanceof Function,
   text: (v:any) => typeof(v) === type.STRING,
   xml(v:any) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
}