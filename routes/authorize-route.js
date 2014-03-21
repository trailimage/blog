var format = require('../format.js');
var flickr = require('../adapters/flickr.js');
/** @type {String} */
var key = 'authorize';
var log = require('winston');

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.view = function(req, res)
{
	if (format.isEmpty(req.param('oauth_token')))
	{
		log.warn('%s is updating Flickr tokens', req.connection.remoteAddress);
		flickr.getRequestToken(function(url) { res.redirect(url); });
	}
	else
	{
		var token = req.param('oauth_token');
		var verifier = req.param('oauth_verifier');

		flickr.getAccessToken(token, verifier, function(accessToken, accessTokenSecret)
		{
			res.render(key,
			{
				'title': 'Flickr Access',
				'token': accessToken,
				'secret': accessTokenSecret
			});
		});
	}
};