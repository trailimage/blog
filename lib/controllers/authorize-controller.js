'use strict';

const TI = require('../');
const is = TI.is;
const template = TI.template;
const db = TI.active;
const FlickrPhoto = TI.Provider.Photo.Flickr;
const GoogleFile = TI.Provider.File.Google;

/**
 *
 * @param req
 * @param res
 * @see https://github.com/google/google-api-nodejs-client/#generating-an-authentication-url
 */
exports.view = (req, res) => {
	if (db.needsAuth) {
		if (db.photo.needsAuth) {

		} else if (db.file.needsAuth) {
			res.redirect(db.file.authorizationURL);
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
			db.log.warn('%s is updating Flickr tokens', req.connection.remoteAddress);
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
	let provider = TI.active.file;

	if (provider instanceof GoogleFile) {
		let code = req.params('code');
		if (is.empty(code)) {
			db.log.error('Cannot continue without Google authorization code');
			res.internalError();
		} else {
			provider.getAccessToken(code, (accessToken, refreshToken, refreshTokenExpiration) => {
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
		db.log.error('Authorization for %s is not supported', provider.toString());
		res.notFound();
	}
};