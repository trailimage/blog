'use strict';

exports.value = function(text) {
	return text !== undefined || text !== null;
};

exports.date = function(value) {
	return exports.value(value) && value instanceof Date;
};

/**
 * Check if text is any kind of empty
 * @param {String} text
 * @return {Boolean}
 * @static
 */
exports.empty = function(text) {
	return (!exports.value(text)) || text === "";
};
