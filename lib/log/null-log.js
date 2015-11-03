'use strict';

const LogBase = require('./log-base.js');

/**
 * No logging
 * @extends {LogBase}
 */
class NullLog extends LogBase {
	constructor() {
		console.warn('Logging disabled');
	}
}

module.exports = NullLog;