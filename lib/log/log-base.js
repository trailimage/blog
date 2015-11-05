'use strict';

class LogBase {
	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	info(message, args) {}

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	warn(message, args) {}

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	error(message, args) {}

	query(options, callback) { callback(null); }
}

module.exports = LogBase;