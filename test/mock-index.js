'use strict';

const lib = require('../lib/index.js');
const NullLog = lib.Log.Null;

app.provider.log = new NullLog();

module.exports = lib;