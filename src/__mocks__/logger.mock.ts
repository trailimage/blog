// Based on Winston-Spy https://github.com/manuelcabral/winston-spy
import * as util from 'util';
import winston from 'winston';

const mockLogger = function(callback) {
   this.echo = callback;
};

util.inherits(mockLogger, winston.Transport);

mockLogger.prototype.name = 'mockLogger';
mockLogger.prototype.log = function(level, msg, meta, callback) {
   this.echo(level, msg, meta);
   callback(null, true);
};

module.exports = winston.transports.MockLogger = mockLogger;
