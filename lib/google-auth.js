'use strict';

const Google = require('googleapis');

/**
 * Manage Google OAuth authentication
 * @alias TI.Auth.Google
 * @extends TI.Auth.Base
 */
class GoogleAuth extends TI.Auth.Base {
	/**
	 * @param {String} scope Authorization scope
	 * @param {OAuthOptions} options
	 */
	constructor(scope, options) {
		super();

		/**
		 * Security scope
		 * @type String
		 * @private
		 */
		this._scope = scope;

		/**
		 * @type OAuthOptions
		 * @private
		 */
		this._options = extend(new TI.Auth.Options(2), options);

		/**
		 * @type OAuth2Client
		 * @private
		 */
		this._client = new Google.auth.OAuth2(this._options.clientID, this._options.clientSecret, this._options.callback);

		/**
		 * @type Boolean
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
	 * @returns {{Object.<String>}}
	 */





	get authorizationURL() {
		return this.client.generateAuthUrl({
			access_type: 'offline',    // gets refresh token
			approval_prompt: 'force',  // gets refresh token every time
			scope: this._scope
		});
	}
}



module.exports = GoogleAuth;