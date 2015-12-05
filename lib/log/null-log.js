'use strict';

const LogBase = require('./log-base.js');

/**
 * No logging
 * @extends {LogBase}
 */
class NullLog extends LogBase {
	constructor() {
		super();
	}
}

module.exports = NullLog;