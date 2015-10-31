'use strict';

class LogProvider {
	/**
	 * @param {String} message
	 * @param {...String} substitutions
	 */
	info(message, ...substitutions) {}

	/**
	 * @param {String} message
	 * @param {...String} substitutions
	 */
	warn(message, ...substitutions) {}

	/**
	 * @param {String} message
	 * @param {...String} substitutions
	 */
	error(message, ...substitutions) {}

	query(options, callback) { callback(null); }
}

module.exports = LogProvider;