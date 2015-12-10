'use strict';

class LogIndex {
	/**
	 * @returns {LogBase}
	 * @constructor
	 */
	static get Base() { return require('./log-base.js'); }

	/**
	 * @returns {ConsoleLog}
	 * @constructor
	 */
	static get Console() { return require('./console-log.js'); }

	/**
	 * @returns {NullLog}
	 * @constructor
	 */
	static get Null() { return require('./null-log.js'); }

	/**
	 * @returns {WinstonLog}
	 * @constructor
	 */
	static get Winston() { return require('./winston-log.js'); }

	/**
	 * @returns {RedisLog}
	 * @constructor
	 */
	static get Redis() { return require('../providers/redis/redis-log.js'); }
}

module.exports = LogIndex;