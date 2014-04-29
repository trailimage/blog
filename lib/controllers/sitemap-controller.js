exports.key = 'sitemap';

/**
 * Default route action
 */
exports.view = function(req, res)
{
	res.fromCache(exports.key, 'application/xml', function(render)
	{
		var library = require('../models/library.js');
		var setting = require('../settings.js');

		render('sitemap-xml',
		{
			'posts': library.posts,
			'tags': library.tagSlugs(),
			'photoTags': library.photoTags,
			'layout': null
		});
	});
};