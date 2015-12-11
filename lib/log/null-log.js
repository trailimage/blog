'use strict';

const LogBase = require('./').Base;

/**
 * No logging
 * @extends {LogBase}
 * @namespace TI.Provider.Log.Null
 */
class NullLog extends LogBase {
	constructor() {
		super();
	}
}

module.exports = NullLog;