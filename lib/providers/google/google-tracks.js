'use strict';

const TrackBase = require('../track-base');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = require('../../auth/oauth-options.js');
const log = require('../../config.js').provider.log;

/**
 * @extends {TrackBase}
 * @extends {OAuthBase}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleTracks extends TrackBase {
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
	 * @param {Post} post
	 * @see https://developers.google.com/drive/v2/reference/children/list
	 */
	_loadGeoFromSource(post) {
		this.drive.children.list({ folderId: this.options.tracksFolder }, (err, list) => {
			let x = list;
		});
	}

	/**
	 * Retrieve access and refresh tokens
	 * @param {String|Object} code
	 * @param {function(String, String)} callback
	 */
	getAccessToken(code, callback) {
		this.oauth.getToken(code, (err, tokens) => {
			if (err != null) {

			} else {
				this.oauth.setCredentials(tokens);
				callback(tokens);
			}
		});
	};
}

module.exports = GoogleTracks;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,
	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};