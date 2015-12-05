'use strict';

class OAuthBase {
	/**
	 * Retrieve access and refresh tokens
	 * @param {String|Object} code
	 * @param {function(String, String, Date)} callback
	 */
	getAccessToken(code, callback) {}
}

module.exports = OAuthBase;
