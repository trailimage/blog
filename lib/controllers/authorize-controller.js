'use strict';

const is = require('../is.js');
const template = require('../template.js');
const config = require('../config.js');
const db = require('../config.js').provider;
const FlickrPhoto = require('../providers/flickr/flickr-photo.js');
const GoogleMap = require('../providers/google/google-gpx.js');
const request = require('request');

/**
 *
 * @param req
 * @param res
 * @see https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
exports.view = (req, res) => {
	if (db.needsAuth) {
		if (db.photo.needsAuth) {

		} else if (db.map.needsAuth) {
			/** @type {GoogleGPX} */
			let google = db.map;
			let authUrl = google.oauth.generateAuthUrl({
				access_type: 'offline',    // gets refresh token
				approval_prompt: 'force',  // gets refresh token every time
				scope: 'https://www.googleapis.com/auth/drive.readonly'
			});

			res.redirect(authUrl);
		}
	} else {
		// we shouldn't be here
	}
};


/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.flickr = (req, res) => {
	let flickr = db.photo;

	if (flickr instanceof FlickrPhoto) {
		if (is.empty(req.param('oauth_token'))) {
			log.warn('%s is updating Flickr tokens', req.connection.remoteAddress);
			flickr.getRequestToken(function(url) { res.redirect(url); });
		} else {
			let token = req.param('oauth_token');
			let verifier = req.param('oauth_verifier');

			flickr.getAccessToken(token, verifier, (accessToken, accessTokenSecret) => {
				if (accessToken != null) {
					res.render(template.page.authorize, {
						title: 'Flickr Access',
						token: accessToken,
						secret: accessTokenSecret,
						layout: template.layout.none
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
 * @see https://github.com/google/google-api-nodejs-client/
 */
exports.google = (req, res) => {
	let provider = config.provider.map;

	if (provider instanceof GoogleMap) {
		let code = req.param('code');
		if (is.empty(code)) {

		} else {
			provider.getAccessToken(code, (accessToken, refreshToken) => {
				// tokens includes access and optional refresh token
				res.render(template.page.authorize, {
					title: 'Google Access',
					token: accessToken,
					secret: refreshToken,
					layout: template.layout.none
				});
			});
		}
	} else {
		// google is not the current provider
	}
};