'use strict';

const is = require('../is.js');
const template = require('../template.js');
const config = require('../config.js');
const FlickrPhoto = require('../providers/flickr/flickr-photo.js');
const GoogleFile = require('../providers/google/google-file.js');
const request = require('request');
const log = config.provider.log;

/**
 *
 * @param req
 * @param res
 */
exports.view = (req, res) => {
	if (config.provider.needsAuth) {
		if (config.provider.photo.needsAuth) {

		} else if (config.provider.file.needsAuth) {
			/** @type {GoogleFile} */
			let google = config.provider.file;
			let authUrl = google.oauth.generateAuthUrl({
				access_type: 'online',
				scope: 'https://www.googleapis.com/auth/drive'
			});

			res.redirect(authUrl);
		}
	} else {
		// we shouldn't be here
	}

	//4/xcLErv6MN1-NCAf3s6l24yQCZUIbo5vUSWWm-IIfKRI#


	//let options = {
	//	url: authUrl,
	//	headers: { 'User-Agent': 'node.js' }
	//};
	//
	//if (!is.empty(config.proxy)) { options.proxy = config.proxy; }
	//
	//request(options, (error, response, body) => {
	//	res.render(template.page.authorize, {
	//		title: 'Flickr Access',
	//		token: 'no token',
	//		secret: 'no token secret',
	//		layout: template.layout.none
	//	});
	//});
};


/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.flickr = (req, res) => {
	let provider = config.provider.photo;

	if (provider instanceof FlickrPhoto) {
		if (is.empty(req.param('oauth_token'))) {
			log.warn('%s is updating Flickr tokens', req.connection.remoteAddress);
			flickr.getRequestToken(function(url) { res.redirect(url); });
		} else {
			let token = req.param('oauth_token');
			let verifier = req.param('oauth_verifier');

			provider.getAccessToken(token, verifier, (accessToken, accessTokenSecret) => {
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
 * https://github.com/google/google-api-nodejs-client/
 */
exports.google = (req, res) => {
	let provider = config.provider.file;

	if (provider instanceof GoogleFile) {
		let code = req.param('code');
		if (is.empty(code)) {

		} else {
			provider.getAccessToken(code, tokens => {
				res.render(template.page.authorize, {
					title: 'Google Access',
					access: JSON.stringify(tokens),
					layout: template.layout.none
				});
			});

			// 4/xcLErv6MN1-NCAf3s6l24yQCZUIbo5vUSWWm-IIfKRI#
		}
	} else {
		// google is not the current provider
	}
};