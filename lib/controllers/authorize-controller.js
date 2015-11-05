'use strict';

const is = require('../is.js');
const config = require('../config.js');
const FlickrData = require('../providers/flickr/flickr-data.js');
const GoogleFile = require('../providers/google/google-file.js');
const log = config.provider.log;
const key = 'authorize';

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.flickr = (req, res) => {
	let db = config.provider.data;

	if (db instanceof FlickrData) {
		if (is.empty(req.param('oauth_token'))) {
			log.warn('%s is updating Flickr tokens', req.connection.remoteAddress);
			flickr.getRequestToken(function(url) { res.redirect(url); });
		} else {
			let token = req.param('oauth_token');
			let verifier = req.param('oauth_verifier');

			db.getAccessToken(token, verifier, (accessToken, accessTokenSecret) => {
				if (accessToken != null) {
					res.render(key, {
						title: 'Flickr Access',
						token: accessToken,
						secret: accessTokenSecret
					});
				} else {
					// failed to get tokens
				}
			});
		}
	} else {
		// flickr is not the current provider
	}
};

/**
 * https://github.com/google/google-api-nodejs-client/
 */
exports.google = (req, res) => {
	let file = config.provider.file;

	if (file instanceof GoogleFile) {
		let code = req.param('code');
		if (is.empty(code)) {

		} else {

		}
	} else {
		// google is not the current provider
	}
};