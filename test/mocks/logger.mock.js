// Based on Winston-Spy https://github.com/manuelcabral/winston-spy
const util = require('util');
const winston = require('winston');

/**
 * @param {Function} callback Method that will be called with log statement
 */
let mockLogger = function(callback) { this.echo = callback; };

util.inherits(mockLogger, winston.Transport);

mockLogger.prototype.name = 'mockLogger';
mockLogger.prototype.log = function(level, msg, meta, callback) {
   this.echo(level, msg, meta);
   callback(null, true);
};

module.exports = winston.transports.MockLogger = mockLogger;