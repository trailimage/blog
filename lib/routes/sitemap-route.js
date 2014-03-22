/** @type {String} */
var key = 'sitemap';
var log = require('winston');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	res.fromCache(key, 'application/xml', function(cacher)
	{
		var library = require('../models/library.js');

		cacher('sitemap-xml',
		{
			'posts': library.posts,
			'tags': library.tagSlugs(),
			'layout': null
		});
	});
};