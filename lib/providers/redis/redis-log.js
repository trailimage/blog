'use strict';

const is = require('../../is.js');
const WinstonLog = require('../../log/winston-log.js');
const RedisTx = require('winston-redis').Redis;
const URL = require('url');

/**
 * Use Winston for Redis logging
 * @extends {LogBase}
 * @extends {WinstonLog}
 * @see https://github.com/winstonjs/winston-redis
 */
class RedisLog extends WinstonLog {
	/**
	 * @param {String} redisUrl
	 */
	constructor(redisUrl) {
		/** @type {Url} */
		let url = URL.parse(redisUrl);
		/**
		 * winston-redis only wants password for auth
		 * @type {String}
		 */
		let password = url.auth.split(':')[1];

		let redis = new RedisTx({
			host: url.hostname,
			port: url.port,
			auth: password,
			length: 10000
		});

		super(redis);

		this.queryable = true;
	}
}

module.exports = RedisLog;