var key = 'sitemap';

/**
 * Default route action
 */
exports.view = function(req, res)
{
	res.fromCache(key, 'application/xml', function(render)
	{
		var library = require('../models/library.js');

		render('sitemap-xml',
		{
			'posts': library.posts,
			'tags': library.tagSlugs(),
			'layout': null
		});
	});
};