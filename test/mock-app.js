'use strict';

const app = require('../lib/index.js');
const NullLog = require('../lib/log/null-log.js');

app.provider.log = new NullLog();

module.exports = app;