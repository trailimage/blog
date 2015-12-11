'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.Provider.Log
 */
class LogNamespace {
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

/**
 * @returns {LogBase}
 * @constructor
 */
LogNamespace.Base = require('./log-base.js');

module.exports = LogNamespace;