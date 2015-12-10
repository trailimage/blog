'use strict';

const TI = require('../../');
const config = TI.config;
const is = TI.is;
const format = TI.format;
const db = TI.active;
const FileBase = TI.Provider.File.Base;
const extend = require('extend');
const GoogleDrive = require('googleapis').drive;
const GoogleAuth = TI.Auth.Google;
const ServerResponse = require('http').ServerResponse;
const request = require('request');
const removeHeaders = ['x-goog-hash','x-guploader-uploadid','expires','cache-control','alt-svc','via','server'];

/**
 * Retrieve Google drive files related to post
 * @extends {FileBase}
 * @extends {OAuthBase}
 * @see https://developers.google.com/drive/v2/reference/
 * @see https://developers.google.com/drive/v2/reference/files/get#examples
 * @see https://github.com/google/google-api-nodejs-client/
 * @see https://developers.google.com/apis-explorer/#p/
 */
class GoogleFile extends FileBase {
	/**
	 * @param {Object} options
	 */
	constructor(options) {
		super();
		/** @type {defaultGoogleOptions} */
		this.options = extend(true, defaultGoogleOptions, options);
		this.auth = new GoogleAuth(GoogleAuth.Scope.drive, this.options.auth);
		this.drive = GoogleDrive({ version: 'v2', auth: this.auth.client });
		// auth options are in the auth helper
		delete this.options.auth;
	}

	/**
	 * @returns {Boolean}
	 */
	get needsAuth() { return this.auth.needed; }

	/**
	 * @param {Boolean} needs
	 */
	set needsAuth(needs) { this.auth.needed = needs; }

	/**
	 * @param {Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX string
	 * @see https://developers.google.com/drive/v2/reference/children/list
	 */
	loadGPX(post, callback) {
		this.auth.verify(ready => {
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
					let icon = TI.icon.saveFile;

					if (callback instanceof ServerResponse) {
						purpose = 'Downloading';
						icon = TI.icon.save;
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
		this.auth.verify(ready => {
			if (!ready) { return returnError(callback); }

			url = url + '?alt=media';

			let slug = post.isPartial ? post.seriesSlug : post.slug;
			let options = {
				url: url,
				headers: this.auth.requestHeader
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

	getAccessToken(code, callback) { this.auth.getAccessToken(code, callback); };
	get authorizationURL() { return this.auth.authorizationURL; }
}

module.exports = GoogleFile;

// - Private static members ---------------------------------------------------

let defaultGoogleOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,
	/** @type {OAuthOptions} */
	auth: null
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