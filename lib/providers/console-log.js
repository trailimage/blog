'use strict';

const LogProvider = require('./log-provider.js');

/**
 * Use Winston for Redis logging
 * @extends {LogProvider}
 */
class ConsolLog extends LogProvider {
	/**
	 * @param {String} message
	 */
	info(message) {
		console.info(message)
	}

	/**
	 * @param {String} message
	 */
	warn(message) {
		console.warn(message)
	}

	/**
	 * @param {String} message
	 */
	error(message) {
		console.error(message)
	}

	query(options, callback) { callback(null); }
}

module.exports = ConsolLog;