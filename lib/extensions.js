"use strict";

/**
 * Copy map key/values to new map instance
 * @returns {Map}
 */
Map.prototype.copy = function() {
	var c = new Map();
	for (let [key, value] of this) { c.set(key, value); }
	return c;
};