"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type = {
    UNDEFINED: 'undefined',
    BOOLEAN: 'boolean',
    NUMBER: 'number',
    STRING: 'string',
    SYMBOL: 'symbol',
    FUNCTION: 'function',
    OBJECT: 'object'
};
function value(x) { return (x !== undefined && x !== null); }
const defined = (obj, field) => value(obj) && value(obj[field]);
const empty = (x) => !value(x) || x === '';
function number(n) {
    return value(n) && typeof (n) === type.NUMBER;
}
function numeric(n) {
    return integer(n) || /^\d+$/.test(n);
}
function integer(n) {
    return value(n) && parseInt(n) === n;
}
function date(v) {
    return value(v) && v instanceof Date;
}
function text(v) {
    return typeof (v) === type.STRING;
}
function callable(v) {
    return value(v) && v instanceof Function;
}
const bigInt = (n) => integer(n) && (n < -32768 || n > 32767);
function cacheItem(o) {
    return (value(o) && o['buffer'] !== undefined && o['eTag'] !== undefined);
}
function array(v) {
    return value(v) && Array.isArray(v);
}
exports.default = {
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
    xml(v) { return this.text(v) && /^<\?xml version="[\d\.]+"/.test(v); }
};
