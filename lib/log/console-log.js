'use strict';

const ConsoleTx = require('winston').transports.Console;
const WinstonLog = require('./').Winston;

/**
 * Use Winston for console logging
 * @extends {LogBase}
 * @extends {WinstonLog}
 * @namespace TI.Provider.Log.Winston
 */
class ConsoleLog extends WinstonLog {
	constructor() {
		super(new ConsoleTx());
	}
}

module.exports = ConsoleLog;