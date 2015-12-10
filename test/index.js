'use strict';

/**
 * @type {TrailImageIndex}
 */
const TI = require('../lib');

TI.provider.log = new TI.Log.Null();

TI.Mock = class {
	static get Request() { return require('./mock-request.js'); }
	static get Response() { return require('./mock-response.js'); }
};


module.exports = TI;