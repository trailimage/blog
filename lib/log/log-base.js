'use strict';

class LogBase {
	/**
	 * @param {String} message
	 */
	info(message) {}

	/**
	 * @param {String} message
	 */
	warn(message) {}

	/**
	 * @param {String} message
	 */
	error(message) {}

	query(options, callback) { callback(null); }
}

module.exports = LogBase;