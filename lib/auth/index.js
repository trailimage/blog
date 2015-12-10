'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 */
class AuthNamespace {
	/**
	 * @returns {OAuth}
	 * @constructor
	 */
	static get Helper() { return require('./oauth-helper.js'); }

	/**
	 * @returns {GoogleAuth}
	 * @constructor
	 */
	static get Google() { return require('../providers/google/google-auth.js'); }
}

/**
 * @returns {OAuthOptions}
 * @constructor
 */
AuthNamespace.Options = require('./oauth-options.js');

/**
 * @returns {OAuthBase}
 * @constructor
 */
AuthNamespace.Base = require('./oauth-base.js');

module.exports = AuthNamespace;