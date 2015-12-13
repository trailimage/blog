'use strict';

const TI = require('../lib');

TI.active.log = new TI.Provider.Log.Null();

/**
 * @namespace
 */
TI.Mock = class {
	static get Request() { return require('./mock-request.js'); }
	static get Response() { return require('./mock-response.js'); }
};


module.exports = TI;