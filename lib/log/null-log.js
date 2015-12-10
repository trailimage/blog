'use strict';

const LogBase = require('./').Base;

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