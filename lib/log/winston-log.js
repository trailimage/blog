'use strict';

const is = require('../is.js');
const Winston = require('winston');
const LogBase = require('./log-base.js');

/**
 * Base for log providers that use Winston
 * @extends {LogBase}
 */
class WinstonLog extends LogBase {
	constructor(transport) {
		super();
		this.provider = new Winston.Logger({ transports: [ transport ]});
	}

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	info(message, args) { this._invoke(level.info, arguments); }

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	warn(message, args) { this._invoke(level.warn, arguments); }

	/**
	 * @param {String} message
	 * @param {...String} args
	 */
	error(message, args) { this._invoke(level.error, arguments); }

	query(options, callback) {
		this.provider.query.call(this.provider, options, callback);
	}

	/**
	 * @param {String} l
	 * @param args
	 * @private
	 */
	_invoke(l, args) {
		this.provider[l].apply(this.provider, args);
	}
}

module.exports = WinstonLog;

// - Private static members ---------------------------------------------------

const level = {
	debug: 'debug',
	info: 'info',
	warn: 'warn',
	error: 'error'
};