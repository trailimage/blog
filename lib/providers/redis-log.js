'use strict';

const is = require('../is.js');
const WinstonLog = require('./winston-log.js');
const RedisTx = require('winston-redis').Redis;

/**
 * Use Winston for Redis logging
 * @extends {LogProvider}
 * @extends {WinstonLog}
 */
class RedisLog extends WinstonLog {
	constructor(url) {
		let host = config.fromUrl(url);

		let redis = new RedisTx({
			host: host.url,
			port: host.port,
			auth: host.password,
			length: 10000
		});

		super(redis);
	}
}

module.exports = RedisLog;