'use strict';

/**
 * Remove pattern from string
 * @param {RegExp} re
 * @returns {String}
 */
String.prototype.remove = function(re) { return this.replace(re, ''); };

//Date.prototype.toJSON = function() {
//	function f(n) {
//		// Format integers to have at least two digits.
//		return n < 10 ? '0' + n : n;
//	}
//
//	return this.getUTCFullYear() + '-' +
//		f(this.getUTCMonth() + 1) + '-' +
//		f(this.getUTCDate()) + 'T' +
//		f(this.getUTCHours()) + ':' +
//		f(this.getUTCMinutes()) + ':' +
//		f(this.getUTCSeconds()) + '.' +
//		f(this.getUTCMilliseconds()) + 'Z';
//};

//Map.prototype.copy = function() {
//	let c = new Map();
//	for (let [key, value] of this) { c.set(key, value); }
//	return c;
//};
