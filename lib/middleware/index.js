'use strict';

/**
 * @namespace TI.Middleware
 */
class MiddlewareNamespace {
	static get outputCache() { return require('./output-cache.js'); }
	static get referralBlocker() { return require('./referral-blocker.js'); }
}

module.exports = MiddlewareNamespace;
