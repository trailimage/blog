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

/**
 * @see http://www.lipsum.com/
 * @type String
 */
TI.lipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
TI.fontFile = "test/pdf/droidsans.ttf";

module.exports = TI;