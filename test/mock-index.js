'use strict';

const lib = require('../lib/index.js');
const NullLog = lib.Log.Null;

lib.provider.log = new NullLog();

/** @type {LibraryIndex} */
module.exports = lib;