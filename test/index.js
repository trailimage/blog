'use strict';

/**
 * @type {LibraryIndex}
 */
const lib = require('../lib');

lib.provider.log = new lib.Log.Null();

lib.Mock = class {
	static get Request() { return require('./mock-request.js'); }
	static get Response() { return require('./mock-response.js'); }
};


module.exports = lib;