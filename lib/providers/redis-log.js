'use strict';

const is = require('../is.js');
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

		let redis = new winston.transports.Redis({
			host: setting.redis.hostname,
			port: setting.redis.port,
			auth: setting.redis.auth,
			length: 10000
		});
		/**
		 * @type {winston.Logger}
		 */
		this.provider = new winston.Logger({ transports: [ redis ]});
	}

	/**
	 * @param {String} message
	 * @param {...String} subs
	 */
	info(message, ...subs) { this._invoke(level.info, message, subs); }

	/**
	 * @param {String} message
	 * @param {...String} subs
	 */
	warn(message, ...subs) { this._invoke(level.warn, message, subs); }

	/**
	 * @param {String} message
	 * @param {...String} subs
	 */
	error(message, ...subs) { this._invoke(level.error, message, subs); }

	query(options, callback) {
		this.provider.query.call(this.provider, options, callback);
	}

	/**
	 * @param {String} l
	 * @param {String} message
	 * @param {String[]} subs Substitutions
	 * @private
	 */
	_invoke(l, message, subs) {
		if (is.array(subs)) {
			// insert message at head of array
			subs.unshift(message);
		} else {
			subs = [message];
		}
		this.provider[l].apply(this.provider, subs);
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