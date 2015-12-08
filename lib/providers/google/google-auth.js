'use strict';

const Enum = require('../../enum.js');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthBase = require('../../auth/oauth-base.js');
const OAuthOptions = require('../../auth/oauth-options.js');

class GoogleAuth extends OAuthBase {
	/**
	 * @param {String} scope Authorization scope
	 */
	constructor(scope) {
		super();

		this.scope = scope;

		/** @type {Google.auth.OAuth2} */
		this.oauth = new OAuth2(oa.clientID, oa.clientSecret, oa.callback);

		if (oa.needsAuth) {
			this.needsAuth = true;
		} else {
			this.oauth.setCredentials({
				access_token: oa.accessToken,
				refresh_token: oa.refreshToken
			});
		}
	}

	/**
	 * Refresh access token as needed
	 * @param {function(Boolean)} callback
	 * @see https://github.com/google/google-api-nodejs-client/#manually-refreshing-access-token
	 * @private
	 */
	verify(callback) {
		if (this.options.auth.needsRefresh) {
			this.oauth.refreshAccessToken((err, tokens) => {
				if (err === null) {
					db.log.infoIcon(Enum.icon.lock, 'Refreshed Google access token');

					this.oauth.setCredentials(tokens);
					// also update options used to build download header
					this.options.auth.accessToken = tokens.access_token;
					this.options.auth.accessTokenExpiration = tokens.expiry_date;

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
		this.oauth.getToken(code, (err, tokens) => {
			if (err !== null) {
				db.log.error('Getting Google access token failed because of %s', err.message);
				callback(null, null, null);
			} else {
				this.oauth.setCredentials(tokens);
				callback(tokens.access_token, tokens.refresh_token, new Date(tokens.expiry_date));
			}

		});
	};

	get authorizationURL() {
		return google.oauth.generateAuthUrl({
			access_type: 'offline',    // gets refresh token
			approval_prompt: 'force',  // gets refresh token every time
			scope: 'https://www.googleapis.com/auth/drive.readonly'
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

GoogleAuth.Options = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,
	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};

module.exports = GoogleAuth;