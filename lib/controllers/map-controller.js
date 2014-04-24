var setting = require('../settings.js');
var format = require('../format.js');
var Enum = require('../enum.js');
var map = require('../models/map.js');
var library = require('../models/library.js');
var Post = require('../models/post.js');
var log = require('winston');

exports.view = function(req, res)
{
	res.render('map',
	{
		'layout': 'layouts/empty',
		'title': 'Map',
		'post': library.postWithSlug(req.params.slug),
		'photoID': req.params.photoID || 0,
		'setting': setting
	});
};

exports.json = function(req, res) { sendJSON(res, req.params.slug) };

/**
 *
 * @param res
 * @param {String} slug
 * @param {Boolean} [autoCreate] Whether to create GPX from photos if none is cached
 */
function sendJSON(res, slug, autoCreate)
{
	if (autoCreate === undefined) { autoCreate = true; }

	map.loadGPX(slug, function(item)
	{
		if (item)
		{
			res.sendCompressed('application/json', new Buffer(item.buffer, 'hex'), item.eTag, false);
		}
		else if (autoCreate)
		{
			var post = library.postWithSlug(slug);

			if (post)
			{
				map.makeGPX(post, function(success)
				{
					if (success) { sendJSON(res, slug, false); } else { notFound(res); }
				});
			}
			else { notFound(res); }
		}
		else { notFound(res); }
	});
}

function notFound(res)
{
	res.status(404);
	res.send({ error: 'Not found' });
}