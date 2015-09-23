'use strict';

/**
 * Remove pattern from string
 * @param {RegExp|String} re
 * @returns {string}
 */
String.prototype.remove = function(re) { return this.replace(re, ''); };

/**
 * Copy map key/values to new map instance
 * @returns {Map}
 */
//Map.prototype.copy = function() {
//	let c = new Map();
//	for (let [key, value] of this) { c.set(key, value); }
//	return c;
//};
