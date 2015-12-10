'use strict';

/**
 * @namespace
 * @name MiddlewareNamespace
 * @property {exports|module.exports} outputCache
 * @property {exports|module.exports} referralBlocker
 */
class MiddlewareNamespace {
	static get outputCache() { return require('./output-cache.js'); }
	static get referralBlocker() { return require('./referral-blocker.js'); }
}

module.exports = MiddlewareNamespace;
