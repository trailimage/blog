'use strict';

/**
 * @namespace TI.Provider.Log.Base
 */
class LogBase {
	constructor() {
		/**
		 * Whether log provider still needs to be authorized (i.e. OAuth)
		 * @type boolean
		 */
		this.needsAuth = false;

		/**
		 * Whether log entries can be queried
		 * @type boolean
		 */
		this.queryable = false;
	}
	/**
	 * @param {String} message
	 * @param {...String|Number} args
	 */
	info(message, args) {}

	/**
	 * @param {String} icon
	 * @param {String} message
	 * @param {...String|Number} args
	 */
	infoIcon(icon, message, args) {}

	/**
	 * @param {String} message
	 * @param {...String|Number} args
	 */
	warn(message, args) {}

	/**
	 * @param {String} icon
	 * @param {String} message
	 * @param {...String|Number} args
	 */
	warnIcon(icon, message, args) {}

	/**
	 * @param {String} message
	 * @param {...String|Number} args
	 */
	error(message, args) {}

	/**
	 * @param {String} icon
	 * @param {String} message
	 * @param {...String|Number} args
	 */
	errorIcon(icon, message, args) {}

	/**
	 * @param {Number} daysAgo
	 * @param {Number} maxRows Max rows or callback
	 * @param {Function} callback
	 */
	query(daysAgo, maxRows, callback) {	}
}

module.exports = LogBase;