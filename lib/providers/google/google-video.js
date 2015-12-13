'use strict';

const TI = require('../../');
const FileBase = TI.Provider.File.Base;
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = TI.Auth.Options;

/**
 * Retrieve GPS file for post
 * @alias TI.Provider.Video.Google
 * @extends {TI.Provider.File.Base}
 * @extends {TI.Auth.Base}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleVideo extends FileBase {
	constructor(options) {
		super();

		/** @type {defaultGoogleOptions} */
		this.options = extend(true, defaultGoogleOptions, options);
		/** @type {TI.Auth.Options} */
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
}

module.exports = GoogleVideo;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,

	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};