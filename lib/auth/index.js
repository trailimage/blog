'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace
 * @alias TI.Auth
 */
class AuthNamespace {
	/** @alias TI.Auth.Helper */
	static get Helper() { return require('./oauth-helper.js'); }
	static get Google() { return require('../providers/google/google-auth.js'); }
}

AuthNamespace.Options = require('./oauth-options.js');
AuthNamespace.Base = require('./oauth-base.js');

module.exports = AuthNamespace;