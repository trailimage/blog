'use strict';

/**
 * @type {Logger}
 */
let winston = createLogger();

const level = {
	debug: 'debug',
	info: 'info',
	warn: 'warn',
	error: 'error'
};

/**
 * @param {String} message
 * @see https://github.com/winstonjs/winston#string-interpolation
 */
exports.info = winston[level.info];

/**
 * @param {String} message
 */
exports.warn = winston[level.warn];

/**
 * @param {String} message
 */
exports.error = winston[level.error];

// Private members ------------------------------------------------------------

/**
 * @returns {Logger}
 */
function createLogger() {
	let setting = require('./settings.js');
	let winston = require('winston');
	let transport = null;

	if (setting.isProduction) {
		let redis = require('winston-redis').Redis;
		transport = new winston.transports.Redis({
			host: setting.redis.hostname,
			port: setting.redis.port,
			auth: setting.redis.auth,
			length: 10000
		});
	} else {
		transport = new winston.transports.Console();
	}
	return new winston.Logger({ transports: [ transport ]});
}