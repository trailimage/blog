'use strict';

class LogBase {
	constructor() {
		/**
		 * Whether log provider still needs to be authorized (i.e. OAuth)
		 * @type {boolean}
		 */
		this.needsAuth = false;
	}
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