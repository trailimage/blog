'use strict';

const is = require('../../is.js');
const Enum = require('../../enum.js');
const format = require('../../format.js');
const config = require('../../config.js');
const FileBase = require('../file-base.js');
const extend = require('extend');
const Google = require('googleapis');
const OAuth2 = Google.auth.OAuth2;
const OAuthOptions = require('../../auth/oauth-options.js');
const ServerResponse = require('http').ServerResponse;
const request = require('request');
const db = config.provider;
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];

/**
 * Retrieve GPS file for post
 * @extends {FileBase}
 * @extends {OAuthBase}
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

		this.drive = Google.drive({ version: 'v2', auth: this.oauth });
	}

	/**
	 * @param {Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX string
	 * @see https://developers.google.com/drive/v2/reference/children/list
	 */
	loadGPX(post, callback) {
		this._verifyAuth(ready => {
			if (!ready) { return returnError(callback); }

			let options = {
				folderId: this.options.tracksFolder,
				//q: `title contains '${post.title}' and mimeType = 'text/xml'`
				q: `title = '${post.title}.gpx'`
			};

			this.drive.children.list(options, (err, list) => {
				if (err != null) {
					handleError(post, callback, err);
				} else if (list.items.length == 0) {
					// no matches
					db.log.info('No GPX file found for "%s"', post.title);
					returnError(callback);
				} else {
					let item = list.items[0];
					let purpose = 'Retrieving';
					let icon = Enum.icon.saveFile;

					if (callback instanceof ServerResponse) {
						purpose = 'Downloading';
						icon = Enum.icon.save;
					}
					db.log.infoIcon(icon, '%s GPX for "%s" (%s)', purpose, post.title, item.id);
					this._downloadFile(item.childLink, post, callback);
				}
			});
		});
	}

	/**
	 * @param {String} url Google URL
	 * @param {Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX to method or stream to response
	 * @see https://developers.google.com/drive/v2/reference/files/get
	 * @see https://developers.google.com/drive/web/manage-downloads
	 * @see https://github.com/request/request
	 * @private
	 */
	_downloadFile(url, post, callback) {
		this._verifyAuth(ready => {
			if (!ready) { return returnError(callback); }

			url = url + '?alt=media';

			let slug = post.isPartial ? post.seriesSlug : post.slug;
			let options = {
				url: url,
				headers: {
					'User-Agent': 'node.js',
					'Authorization': 'Bearer ' + this.options.auth.accessToken
				}
			};

			if (!is.empty(config.proxy)) { options.proxy = config.proxy; }

			if (callback instanceof ServerResponse) {
				// pipe request directly to response
				request
					.get(url, options)
					.on('response', res => {
						res.headers['Content-Disposition'] = `attachment; filename="${format.slug(config.title)}_${slug}.gpx"`;
						removeHeaders.forEach(h => { delete res.headers[h]; });
					})
					.on('error', err => { handleError(post, callback, err); })
					.pipe(callback);
			} else {
				// load GPX as string
				request(options, (err, response, body) => {
					if (err === null) {
						if (body.length < 1000) {
							try {
								// assume body contains JSON error message
								handleError(post, callback, JSON.parse(body));
							} catch (ex) {
								// otherwise log body
								db.log.error('Invalid content for %s: %s', url, body);
								callback(null);
							}
						} else {
							db.log.info('Completed GPX retrieval from %s (%d bytes)', url, body.length);
							callback(body);
						}
					} else {
						db.log.error(err.toString());
						callback(null);
					}
				});
			}
		});
	}

	/**
	 * Refresh access token as needed
	 * @param {function(Boolean)} callback
	 * @see https://github.com/google/google-api-nodejs-client/#manually-refreshing-access-token
	 * @private
	 */
	_verifyAuth(callback) {
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
}

module.exports = GoogleFile;

// - Private static members ---------------------------------------------------

const defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,
	/** @type {OAuthOptions} */
	auth: new OAuthOptions(2)
};

/**
 * @param {Post} post
 * @param {function(String)|ServerResponse} callback Return GPX string
 * @param {Object} err
 */
function handleError(post, callback, err) {
	db.log.error('Loading GPX file for "%s" failed because of %s', post.title, JSON.stringify(err));
	returnError(callback);
}

/**
 * Return error through callback or HTTP response
 * @param {function(String)|ServerResponse} callback
 */
function returnError(callback) {
	if (callback instanceof ServerResponse) {
		callback.notFound();
	} else {
		callback(null);
	}
}