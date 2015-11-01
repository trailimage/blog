'use strict';

const is = require('../is.js');
const WinstonLog = require('./winston-log.js');
const RedisTx = require('winston-redis').Redis;
const URL = require('url');

/**
 * Use Winston for Redis logging
 * @extends {LogProvider}
 * @extends {WinstonLog}
 */
class RedisLog extends WinstonLog {
	/**
	 * @param {String} redisUrl
	 */
	constructor(redisUrl) {
		/** @type {Url} */
		let url = URL.parse(redisUrl);

		let redis = new RedisTx({
			host: url.host,
			port: url.port,
			auth: url.auth,
			length: 10000
		});

		super(redis);
	}
}

module.exports = RedisLog;