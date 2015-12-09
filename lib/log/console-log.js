'use strict';

const ConsoleTx = require('winston').transports.Console;
const WinstonLog = require('./winston-log.js');

/**
 * Use Winston for console logging
 * @extends {LogBase}
 * @extends {WinstonLog}
 */
class ConsoleLog extends WinstonLog {
	constructor() {
		super(new ConsoleTx());
	}
}

module.exports = ConsoleLog;