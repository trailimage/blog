'use strict';

/**
 * @namespace
 * @alias TI.Auth.Base
 */
class OAuthBase {
	/**
	 * Retrieve access and refresh tokens
	 * @param {String|Object} code
	 * @param {function(String, String, Date)} callback
	 */
	getAccessToken(code, callback) {}

	/**
	 * @returns String
	 */
	get authorizationURL() { return null; }
}

module.exports = OAuthBase;
