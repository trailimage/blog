'use strict';

class LogIndex {
	static get Base() { return require('./log-base.js'); }
	static get Console() { return require('./console-log.js'); }
	static get Null() { return require('./null-log.js'); }
	static get Winston() { return require('./winston-log.js'); }
	// providers

	static get Redis() { return require('../providers/redis/redis-log.js'); }
}

module.exports = LogIndex;