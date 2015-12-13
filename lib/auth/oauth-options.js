'use strict';

/**
 * @see https://www.flickr.com/services/api/auth.oauth.html
 * @namespace
 * @alias TI.Auth.Options
 */
class OAuthOptions {
	/**
	 * @param {Number} version
	 * @param {String} [clientID]
	 * @param {String} [secret]
	 * @param {String} [callback]
	 * @param {String} [accessToken]
	 * @param {String} [tokenRefreshOrSecret] OAuth 1 secret or OAuth 2 refresh
	 */
	constructor(version, clientID, secret, callback, accessToken, tokenRefreshOrSecret) {
		/**
		 * @type {Number}
		 * @private
		 */
		this._version = version;
		this.encryption = 'HMAC-SHA1';
		/**
		 * May also be called the consumer key, client key or user ID
		 * @type {String}
		 */
		this.clientID = (clientID === undefined) ? null : clientID;
		/**
		 * @type {String}
		 */
		this.clientSecret = (secret === undefined) ? null : secret;
		/**
		 * OAuth 1.0A
		 * Call service with client ID to retrieve request token and token secret which will
		 * subsequently be exchanged for an access token
		 * @type {String}
		 */
		this.tokenSecret = null;
		/**
		 * OAuth 1.0A
		 * Call service with client ID to retrieve request token and token secret which will
		 * subsequently be exchanged for an access token
		 * @type {String}
		 */
		this.requestToken = null;
		/**
		 * @type {String}
		 */
		this.accessToken = (accessToken === undefined) ? null : accessToken;
		/**
		 * @type {null}
		 * @private
		 */
		this._accessTokenExpiration = null;
		/**
		 * OAuth 2.0
		 * @type {String}
		 */
		this.refreshToken = null;

		/**
		 * @type {String} URL
		 */
		this.callback = (callback === undefined) ? null : callback;
		/**
		 * OAuth 1.0A
		 * Returned from service after client authorizes request token
		 * @type {String}
		 */
		this.verifier = null;

		if (tokenRefreshOrSecret !== undefined) {
			if (this._version == 1) {
				this.tokenSecret = tokenRefreshOrSecret;
			} else {
				this.refreshToken = tokenRefreshOrSecret;
			}
		}
	}

	/**
	 * @returns {String}
	 */
	get consumerKey() { return this.clientID; }

	/**
	 * @return {String}
	 */
	get version() { return this._version == 1 ? '1.0A' : '2.0';	}

	/**
	 * Set expiration a minute earlier than actual so refresh occurs before provider blocks request
	 * @param {Number} ms
	 * @example 1449335813845
	 */
	set accessTokenExpiration(ms) {
		let d = new Date(ms);
		d.setMinutes(d.getMinutes() - 1);
		this._accessTokenExpiration = d;
	}

	/**
	 * OAuth 2.0 can generate a new access token from a refresh token
	 * @returns {Boolean}
	 */
	get needsAuth() {
		return ((this._version == 1 && this.accessToken === null) || this.refreshToken === null);
	}

	/**
	 * Whether OAuth 2.0 access token needs to be refreshed
	 * @returns {Boolean}
	 */
	get needsRefresh() {
		return (this.refreshToken !== null && (this._accessTokenExpiration === null || this._accessTokenExpiration < new Date()));
	}
}

module.exports = OAuthOptions;