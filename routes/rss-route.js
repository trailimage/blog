var Setting = require('../settings.js');
var Enum = require('../enum.js');
var Format = require('../format.js');
/** @type {Library} */
var Library = require('../models/library.js');
var Feed = require('feed');
var log = require('winston');
/**
 * @type {number}
 * @const
 */
var MAX_RETRIES = 10;
/** @type {number} */
var retries = 0;

/**
 * Default route action
 */
exports.view = function(req, res)
{
	/** @type {Library} */
	var library = Library.current;

	if (library == null || !library.postInfoLoaded)
	{
		if (retries > MAX_RETRIES)
		{
			log.error('Unable to load library after %d tries', MAX_RETRIES);
			res.render(Enum.httpStatus.notFound, {'title': 'Unable to load feed'});
		}
		else
		{
			retries++;
			log.error('Library not ready when creating menu — attempt %d', retries);
			setTimeout(exports.send, 1000, req, res);
		}
		return;
	}

	/** @type {Post} */
	var post = null,
		feed = new Feed(
	{
		title:          Setting.title,
		description:    Setting.description,
		link:           'http://' + Setting.domain,
		image:          'http://' + Setting.domain + '/img/logo.png',
		copyright:      'Copyright © 2014 Jason Abbott. All rights reserved',
		author:
		{
			name:       'Jason Abbott',
			link:       'https://www.facebook.com/jason.e.abbott'
		}
	});

	for (var i = 0; i < library.posts.length; i++)
	{
		post = library.posts[i];

		if (post.timebound)
		{
			feed.item({
				title: post.title,
				link: Format.string('http://{0}/{1}/', Setting.domain, post.slug),
				description: post.description,
				date: post.createdOn
			});
		}
	}
	res.set('Content-Type', 'text/xml');
	res.send(feed.render('rss-2.0'));
};