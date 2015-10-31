'use strict';

const LogProvider = require('./log-provider.js');

/**
 * No logging
 * @extends {LogProvider}
 */
class NullLog extends LogProvider {
	constructor() {
		console.warn('Logging disabled');
	}
}

module.exports = NullLog;