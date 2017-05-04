import { Cache } from './types/';

/**
 * Javascript type names
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
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
 * Whether variable is defined and not null. This will return `true` for `0`
 * whereas a bare `if (var)` will not.
 */
function value<T>(x:any):x is T { return (x !== undefined && x !== null); }

/**
 * Whether named field is defined in the given object
 *
 * http://jsperf.com/hasownproperty-vs-in-vs-other/16
 */
const defined = (obj:{[key:string]:object}, field:string) =>
   value(obj) && value(obj[field]);

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

function date(v:any):v is Date {
   return value(v) && v instanceof Date;
}

function text(v:any):v is string {
   return typeof(v) === type.STRING;
}

function callable(v:any):v is Function {
   return value(v) && v instanceof Function;
}

const bigInt = (n:any) => integer(n) && (n < -32768 || n > 32767);

function cacheItem(o:any):o is Cache.Item {
   return (value<Object>(o) && o['buffer'] !== undefined && o['eTag'] !== undefined);
}

/** Whether value exists and is an array */
function array(v:any):v is any[] {
   return value(v) && Array.isArray(v);
}

export default {
   type,
   value,
   defined,
   cacheItem,
   number,
   numeric,
   integer,
   bigInt,
   int64: bigInt,
   date,
   text,
   empty,
   callable,
   array,
   xml(v:any) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
};