'use strict';

/**
 * @namespace
 * @alias TI.Middleware
 */
class MiddlewareNamespace {
	static get outputCache() { return require('./output-cache.js'); }
	static get referralBlocker() { return require('./referral-blocker.js'); }
	static get statusHelper() { return require('./status-helper.js'); }
}

module.exports = MiddlewareNamespace;
