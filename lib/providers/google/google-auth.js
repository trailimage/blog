'use strict';

const TI = require('../../');
const OAuthBase = TI.Auth.Base;
const OAuthOptions = TI.Auth.Options;
const db = TI.provider;
const Google = require('googleapis');
const extend = require('extend');

/**
 * Manage Google OAuth authentication
 * @extends {OAuthBase}
 */
class GoogleAuth extends OAuthBase {
	/**
	 * @param {String} scope Authorization scope
	 * @param {OAuthOptions} options
	 */
	constructor(scope, options) {
		super();

		/**
		 * Security scope
		 * @type {String}
		 * @private
		 */
		this._scope = scope;

		/**
		 * @type {OAuthOptions}
		 * @private
		 */
		this._options = extend(new OAuthOptions(2), options);

		/**
		 * @type {OAuth2Client}
		 * @private
		 */
		this._client = new Google.auth.OAuth2(this._options.clientID, this._options.clientSecret, this._options.callback);

		/**
		 * @type {Boolean}
		 */
		this.needed = false;

		if (this._options.needsAuth) {
			this.needed = true;
		} else {
			this._client.setCredentials({
				access_token: this._options.accessToken,
				refresh_token: this._options.refreshToken
			});
		}
	}

	/**
	 * @returns {OAuth2Client}
	 */
	get client() { return this._client; }

	/**
	 * @returns {Object.<String>}
	 */
	get requestHeader() {
		return {
			'User-Agent': 'node.js',
			'Authorization': 'Bearer ' + this._options.accessToken
		}
	}

	/**
	 * Refresh access token as needed
	 * @param {function(Boolean)} callback
	 * @see https://github.com/google/google-api-nodejs-client/#manually-refreshing-access-token
	 */
	verify(callback) {
		if (this._options.needsRefresh) {
			this._client.refreshAccessToken((err, tokens) => {
				if (err === null) {
					db.log.infoIcon(TI.icon.lock, 'Refreshed Google access token');

					this._client.setCredentials(tokens);
					// also update options used to build download header
					this._options.accessToken = tokens.access_token;
					this._options.accessTokenExpiration = tokens.expiry_date;

					callback(true);
				} else {
					db.log.error('Refreshing Google access token failed because of %s', err.message);
					callback(false);
				}
			});
		} else {
			callback(true);
		}
	}

	/**
	 * Retrieve access and refresh tokens
	 * @param {String|Object} code
	 * @param {function(String, String, Date)} callback
	 */
	getAccessToken(code, callback) {
		this._client.getToken(code, (err, tokens) => {
			if (err !== null) {
				db.log.error('Getting Google access token failed because of %s', err.message);
				callback(null, null, null);
			} else {
				this._client.setCredentials(tokens);
				callback(tokens.access_token, tokens.refresh_token, new Date(tokens.expiry_date));
			}

		});
	};

	get authorizationURL() {
		return this.client.generateAuthUrl({
			access_type: 'offline',    // gets refresh token
			approval_prompt: 'force',  // gets refresh token every time
			scope: this._scope
		});
	}
}

/**
 * @type {Object.<String>}
 * @see https://developers.google.com/drive/web/scopes
 */
GoogleAuth.Scope = {
	drive: 'https://www.googleapis.com/auth/drive',
	driveReadOnly: 'https://www.googleapis.com/auth/drive.readonly',
	photoReadOnly: 'https://www.googleapis.com/auth/drive.photos.readonly'
};

module.exports = GoogleAuth;