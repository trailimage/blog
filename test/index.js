'use strict';

const TI = require('../lib');

TI.active.log = new TI.Provider.Log.Null();

/**
 * @namespace TI.Mock
 */
TI.Mock = class {
	/**
	 * @namespace TI.Mock.Request
	 * @returns {MockRequest}
	 * @constructor
	 */
	static get Request() { return require('./mock-request.js'); }

	/**
	 * @namespace TI.Mock.Response
	 * @returns {MockResponse}
	 * @constructor
	 */
	static get Response() { return require('./mock-response.js'); }
};


module.exports = TI;