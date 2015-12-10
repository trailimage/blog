'use strict';

/** @type {RootNamespace} */
const TI = require('../lib');

TI.active.log = new TI.Provider.Log.Null();

/**
 *
 * @property {MockRequest} Request
 * @property {MockResponse} Response
 */
TI.Mock = class {
	/**
	 * @returns {MockRequest}
	 * @constructor
	 */
	static get Request() { return require('./mock-request.js'); }

	/**
	 * @returns {MockResponse}
	 * @constructor
	 */
	static get Response() { return require('./mock-response.js'); }
};


module.exports = TI;