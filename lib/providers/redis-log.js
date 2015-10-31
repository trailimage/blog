'use strict';

const winston = require('winston');
const redis = require('winston-redis').Redis;
const LogProvider = require('./log-provider.js');

/**
 * Use Winston for Redis logging
 * @extends {LogProvider}
 */
class RedisLog extends LogProvider {
	constructor() {
		super();

		let transport = new winston.transports.Redis({
			host: setting.redis.hostname,
			port: setting.redis.port,
			auth: setting.redis.auth,
			length: 10000
		});
		/**
		 * @type {winston.Logger}
		 */
		this.provider = new winston.Logger({ transports: [ transport ]});
	}


	/**
	 * @param {String} message
	 */
	info(message) { this._invoke(message, level.info); }

	/**
	 * @param {String} message
	 */
	warn(message) { this._invoke(message, level.warn); }

	/**
	 * @param {String} message
	 */
	error(message) { this._invoke(message, level.error); }

	query(options, callback) {
		this.provider.query.call(this.provider, options, callback);
	}

	/**
	 *
	 * @param {String} message
	 * @param {String} l
	 * @private
	 */
	_invoke(message, l) {
		this.provider[l].call(this.provider, message);
	}
}

module.exports = RedisLog;

// - Private static members ---------------------------------------------------

const level = {
	debug: 'debug',
	info: 'info',
	warn: 'warn',
	error: 'error'
};