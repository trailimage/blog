'use strict';

class OAuthOptions {
	/**
	 *
	 * @param {String} clientID
	 * @param {String} secret
	 * @param {String} callback
	 * @param {String} [accessToken]
	 * @param {String} [refreshToken]
	 */
	constructor(clientID, secret, callback, accessToken, refreshToken) {
		this.version = '1.0A';
		this.encryption = 'HMAC-SHA1';
		/**
		 * @type {String}
		 */
		this.clientID = clientID;
		/**
		 * @type {String}
		 */
		this.clientSecret = secret;
		/**
		 * @type {String}
		 */
		this.accessToken = (accessToken === undefined) ? null : accessToken;
		/**
		 * @type {String}
		 */
		this.refreshToken = (refreshToken === undefined) ? null : refreshToken;
		/**
		 * @type {String}
		 */
		this.callback = callback;
	}
}

module.exports = OAuthOptions;