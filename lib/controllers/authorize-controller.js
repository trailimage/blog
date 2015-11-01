'use strict';

const is = require('../is.js');
const config = require('../config.js');
const db = config.provider.library;
const log = config.provider.log;
const key = 'authorize';

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.view = (req, res) => {
	if (is.empty(req.param('oauth_token'))) {
		log.warn('%s is updating Flickr tokens', req.connection.remoteAddress);
		flickr.getRequestToken(function(url) { res.redirect(url); });
	} else {
		let token = req.param('oauth_token');
		let verifier = req.param('oauth_verifier');

		db.getAccessToken(token, verifier, (accessToken, accessTokenSecret) => {
			res.render(key, {
				'title': 'Flickr Access',
				'token': accessToken,
				'secret': accessTokenSecret
			});
		});
	}
};