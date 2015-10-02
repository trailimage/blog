'use strict';

const is = require('../is.js');
const flickr = require('../providers/flickr.js');
/** @type {String} */
const key = 'authorize';
const log = require('../log.js');

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

		flickr.getAccessToken(token, verifier, (accessToken, accessTokenSecret) => {
			res.render(key, {
				'title': 'Flickr Access',
				'token': accessToken,
				'secret': accessTokenSecret
			});
		});
	}
};