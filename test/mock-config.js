'use strict';

const config = require('../lib/config.js');
const NullLog = require('../lib/log/null-log.js');

config.provider.log = new NullLog();