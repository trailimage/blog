'use strict';

class AuthIndex {
	/**
	 * @returns {OAuthBase}
	 * @constructor
	 */
	static get Base() { return require('./oauth-base.js'); }

	/**
	 * @returns {OAuth}
	 * @constructor
	 */
	static get Helper() { return require('./oauth-helper.js'); }

	/**
	 * @returns {OAuthOptions}
	 * @constructor
	 */
	static get Options() { return require('./oauth-options.js'); }

	/**
	 * @returns {GoogleAuth}
	 * @constructor
	 */
	static get Google() { return require('../providers/google/google-auth.js'); }
}

module.exports = AuthIndex;