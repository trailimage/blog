'use strict';

/**
 * @namespace
 * @alias Blog.Middleware
 */
class MiddlewareNamespace {
	static get statusHelper() { return require('./status-helper.js'); }
}

module.exports = MiddlewareNamespace;
