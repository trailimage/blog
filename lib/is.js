'use strict';
/**
 * @module
 * @alias TI.is
 */


/**
 * Check if value is defined and non-null
 * @param {String|Object} v
 * @return {Boolean}
 * @static
 */
exports.value = v => v !== undefined && v !== null;

/**
 * Whether field is defined in object using fastest method
 * @param {Object} object
 * @param {String} field
 * @see http://jsperf.com/hasownproperty-vs-in-vs-other/16
 */
exports.defined = (object, field) => typeof(object[field]) !== 'undefined';

/**
 * Whether value is a number
 * @param v
 * @returns {Boolean}
 */
exports.number = v => exports.value(v) && typeof(v) === 'number';

/**
 * Whether number is an integer
 * @param {Number} n
 * @returns {boolean}
 */
exports.integer = n => exports.number(n) && Number(n) === n && n%1 === 0;

/**
 * Whether number is a big integer
 * @param {Number} n
 * @returns {boolean}
 */
exports.bigInt = n => exports.integer(n) && (n < -32768 || n > 32767);
exports.int64 = exports.bigInt;

/**
 * Whether value is a date
 * @param v
 * @returns {Boolean}
 */
exports.date = v => exports.value(v) && v instanceof Date;

/**
 * Check if text is any kind of empty
 * @param {String} t
 * @return {Boolean}
 * @static
 */
exports.empty = t => (!exports.value(t)) || t === "";

exports.array = v => exports.value(v) && v instanceof Array;

exports.callable = v => exports.value(v) && v instanceof Function;