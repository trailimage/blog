'use strict';

class MiddlewareIndex {
	static get outputCache() { return require('./output-cache.js'); }
	static get referralBlocker() { return require('./referral-blocker.js'); }
}

module.exports = MiddlewareIndex;
