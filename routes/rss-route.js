var Setting = require('../settings.js');
var Enum = require('../enum.js');
var Format = require('../format.js');
/** @type {Metadata} */
var Metadata = require('../metadata/metadata.js');
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
	/** @type {Metadata} */
	var metadata = Metadata.current;

	if (metadata == null || !metadata.setInfoLoaded)
	{
		if (retries > MAX_RETRIES)
		{
			log.error('Unable to load menu after %d tries', MAX_RETRIES);
			res.render(Enum.httpStatus.notFound, {'title': 'Unable to load feed'});
		}
		else
		{
			retries++;
			log.error('Meta not ready when creating menu — attempt %d', retries);
			setTimeout(exports.send, 1000, req, res);
		}
		return;
	}

	/** @type {Metadata.Set} */
	var set = null,
		feed = new Feed(
	{
		title:          Setting.title,
		description:    Setting.description,
		link:           'http://' + Setting.domain,
		image:          'http://' + Setting.domain + '/img/logo.png',
		copyright:      'Copyright © 2013 Jason Abbott. All rights reserved',
		author:
		{
			name:       'Jason Abbott',
			link:       'https://www.facebook.com/jason.e.abbott'
		}
	});

	for (var i = 0; i < metadata.sets.length; i++)
	{
		set = metadata.sets[i];

		if (set.timebound)
		{
			feed.item({
				title: set.title,
				link: Format.string('http://{0}/{1}/', Setting.domain, set.slug),
				description: set.description,
				date: set.createdOn
			});
		}
	}
	res.set('Content-Type', 'text/xml');
	res.send(feed.render('rss-2.0'));
};