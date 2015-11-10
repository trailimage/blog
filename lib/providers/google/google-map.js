'use strict';

const is = require('../../is.js');
const config = require('../../config.js');
const MapBase = require('../../map/map-base');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = require('../../auth/oauth-options.js');
const request = require('request');
const log = config.provider.log;

/**
 * Retrieve GPS file for post
 * @extends {MapBase}
 * @extends {OAuthBase}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleMap extends MapBase {
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
	 * @param {function(String)} callback Return GPX string
	 * @see https://developers.google.com/drive/v2/reference/children/list
	 */
	_loadGpxFromSource(post, callback) {
		let options = {
			folderId: this.options.tracksFolder,
			//q: `title contains '${post.title}' and mimeType = 'text/xml'`
			q: `title = '${post.title}.gpx'`
		};

		this.drive.children.list(options, (err, list) => {
			if (err != null) {
				if (err.code == 401) {
					// refresh access token and try again
					this._refreshAccessToken(success => {
						if (success) {
							// retry call with new auth
							this._loadGpxFromSource(post, callback);
						} else {
							log.error('Loading GPX file for "%s" failed because of %s', post.title, err.message);
							callback(null);
						}
					});
				} else {
					log.error('Loading GPX file for "%s" failed because of %s', post.title, err.message);
					callback(null);
				}
			} else if (list.items.length == 0) {
				// no matches
				log.info('No GPX file found for "%s"', post.title);
				callback(null)
			} else {
				let item = list.items[0];
				log.info('Downloading GPX for "%s" (%s)', post.title, item.id);
				this._downloadFile(item.childLink, callback);
			}
		});
	}

	/**
	 * @param {String} url
	 * @param {function(String)} callback Return GPX
	 * @see https://developers.google.com/drive/v2/reference/files/get
	 * @see https://developers.google.com/drive/web/manage-downloads
	 * @private
	 */
	_downloadFile(url, callback) {
		let options = {
			url: url + '?alt=media',
			headers: {
				'User-Agent': 'node.js',
				'Authorization': 'Bearer ' + this.options.auth.accessToken
			}
		};

		if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

		request(options, (err, response, body) => {
			if (err == null) {
				log.info('Completed GPX download from %s', url);
				callback(body);
			} else {
				log.error(err.toString());
				callback(null);
			}
		});
	}

	/**
	 * Refresh token and indicate success
	 * @param {function(Boolean)} callback
	 * @see https://github.com/google/google-api-nodejs-client/#manually-refreshing-access-token
	 * @private
	 */
	_refreshAccessToken(callback) {
		this.oauth.refreshAccessToken((err, tokens) => {
			if (err == null) {
				log.info('Refreshed Google access token');
				this.oauth.setCredentials(tokens);
				// also update options used to build download header
				this.options.auth.accessToken = tokens.access_token;
				callback(true);
			} else {
				log.error('Refreshing Google access token failed because of %s', err.message);
				callback(false);
			}
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
				log.error('Getting Google access token failed because of %s', err.message);
				callback(null);
			} else {
				this.oauth.setCredentials(tokens);
				callback(tokens.access_token, tokens.refresh_token);
			}

		});
	};
}

module.exports = GoogleMap;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,

	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};