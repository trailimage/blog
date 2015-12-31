'use strict';
/**
 * @module
 * @alias TI.is
 */


/**
 * Check if value is defined and non-null
 * @alias TI.is.value
 * @param {String|Object} v
 * @returns {Boolean}
 * @static
 */
exports.value = v => v !== undefined && v !== null;

/**
 * Whether field is defined in object using fastest method
 * @alias TI.is.defined
 * @param {Object} object
 * @param {String} field
 * @see http://jsperf.com/hasownproperty-vs-in-vs-other/16
 */
exports.defined = (object, field) => typeof(object[field]) !== 'undefined';

/**
 * Whether value is a number
 * @alias TI.is.number
 * @param v
 * @returns {Boolean}
 */
exports.number = v => exports.value(v) && typeof(v) === 'number';

/**
 * Whether number is an integer
 * @alias TI.is.integer
 * @param {Number} n
 * @returns {Boolean}
 */
exports.integer = n => exports.number(n) && Number(n) === n && n%1 === 0;

/**
 * Whether number is a big integer
 * @param {Number} n
 * @returns {Boolean}
 */
exports.bigInt = n => exports.integer(n) && (n < -32768 || n > 32767);
exports.int64 = exports.bigInt;

/**
 * Whether value is a date
 * @alias TI.is.date
 * @param v
 * @returns {Boolean}
 */
exports.date = v => exports.value(v) && v instanceof Date;

/**
 * Check if text is any kind of empty
 * @alias TI.is.emtpy
 * @param {String} t
 * @returns {Boolean}
 * @static
 */
exports.empty = t => (!exports.value(t)) || t === "";

exports.array = v => exports.value(v) && v instanceof Array;

exports.callable = v => exports.value(v) && v instanceof Function;