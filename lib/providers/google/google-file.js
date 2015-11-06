'use strict';

const FileBase = require('../file-base');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = require('../../auth/oauth-options.js');
const log = require('../../config.js').provider.log;

/**
 * @extends {FileBase}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleFile extends FileBase {
	constructor(options) {
		super();

		/** @type {defaultGoogleOptions} */
		this.options = extend(true, defaultGoogleOptions, options);
		/** @type {OAuthOptions} */
		let oa = this.options.auth;
		/** @type {OAuth2} */
		this.oauth = new OAuth2(oa.clientID, oa.clientSecret, oa.callback);

		if (oa.needsAuth) {
			this.needsAuth = true;
		} else {
			this.oauth.setCredentials({
				access_token: oa.accessToken,
				refresh_token: oa.refreshToken
			});
		}

		this.drive = Google.drive({ version: 'v2', auth: this.oauth });
	}

	/**
	 * Retrieve access and refresh tokens
	 * @param {String} code
	 * @param {function(String, String)} callback
	 */
	getAccessToken(code, callback) {
		this.oauth.getToken(code, (err, tokens) => {
			if (err) {

			} else {
				this.oauth.setCredentials(tokens);
				callback(tokens);
			}
		});
	};
}

module.exports = GoogleFile;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};