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


 /** Whether variable is defined and not null */
function value<T>(x:any):x is T { return (x !== undefined && x !== null); }

/**
 * Whether named field is defined in the given object
 * 
 * See http://jsperf.com/hasownproperty-vs-in-vs-other/16
 */
const defined = (obj:{[key:string]:any}, field:string|number) => value(obj) && typeof(obj[field]) !== type.UNDEFINED;

/** Whether value is null, undefined or an empty string */
const empty = (x:any) => !value(x) || x === '';

/** Whether value exists and is a type of number */
function number(n:any):n is number {
   return value(n) && typeof(n) === type.NUMBER;
}

/** Whether value is numeric even if its type is a string */
function numeric(n:any):n is string|number {
   return integer(n) || /^\d+$/.test(n);
}

/** Whether value is an integer */
function integer(n:any):n is string|number {
   return value(n) && parseInt(n as string) === n;
}

function callable(v:any):v is Function {
   return value(v) && v instanceof Function
}

const bigInt = (n:any) => integer(n) && (n < -32768 || n > 32767);

/** Whether value exists and is an array */
function array(x:any):x is any[] {
   return value(x) && Array.isArray(x);
}

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
   callable(v:any):v is Function {
      return value(v) && v instanceof Function
   },
   array(v:any):v is Array<any> { return value(v) && v instanceof Array; },
   text: (v:any) => typeof(v) === type.STRING,
   xml(v:any) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
}