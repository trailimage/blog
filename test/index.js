'use strict';

const TI = require('../lib');

TI.active.log = new TI.Provider.Log.Null();
TI.Mock = require('./mocks');

module.exports = TI;