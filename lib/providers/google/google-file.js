'use strict';

const FileBase = require('../file-base');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
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
		this.oauth = new OAuth2(this.options.clientID, this.options.oauth.secret, this.options.oauth.url);

		this.oauth.setCredentials({
			access_token: this.options.oauth.accessToken,
			refresh_token: this.options.oauth.refreshToken
		});

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
	/** @type {String} */
	clientID: null,
	/** @type {String} */
	secret: null,
	oauth: {
		token: config.env('GOOGLE_TOKEN'),
		secret: config.env('GOOGLE_SECRET'),
		accessToken: null,
		refreshToken: null,
		/**
		 * Callback URL for OAuth call
		 * @type {String}
		 */
		url: null
	}
};