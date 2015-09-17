'use strict';

var format = require('../format.js');
var flickr = require('../adapters/flickr.js');
/** @type {String} */
const key = 'authorize';
const log = require('winston');

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.view = function(req, res) {
	if (format.isEmpty(req.param('oauth_token'))) {
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