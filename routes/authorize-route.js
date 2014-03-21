var Format = require('../format.js');
/** @type {singleton} */
var Flickr = require('../adapters/flickr.js');
var Output = require('../adapters/output.js');
/** @type {String} */
var key = 'authorize';
var log = require('winston');

/**
 * Default route action
 * @see http://www.flickr.com/services/api/auth.oauth.html
 */
exports.view = function(req, res)
{
	/** @type {FlickrAPI} */
	var flickr = Flickr.current;
	var reply = Output.current.responder(key, res, 'text/html');

	if (Format.isEmpty(req.param('oauth_token')))
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
			reply.render(key,
			{
				'title': 'Flickr Access',
				'token': accessToken,
				'secret': accessTokenSecret
			});
		});
	}
};