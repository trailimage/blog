/** @see http://nodejs.org/api/zlib.html */
var compress = require('zlib');
var Setting = require('./settings.js');
var db = require('./adapters/redis.js');
/** @see https://github.com/kangax/html-minifier */
var htmlMinify = require('html-minifier').minify;

module.exports = function()
{
	return function(req, res, next)
	{
		/**
		 * Load output from cache or return renderer that will cache the output
		 * @param {string} key
		 * @param {string|function} p2
		 * @param {function} [p3] Method called if item is not cached
		 */
		res.fromCache = function(key, p2, p3)
		{
			var mimeType = (p3 === undefined) ? 'text/html' : p2;
			var callback = (p3 === undefined) ? p2 : p3;

			if (Setting.cacheOutput)
			{
				db.getAll(key, function(item)
				{
					if (item != null)
					{
						sendCompressed(res, mimeType, new Buffer(item.buffer, 'hex'), item.eTag + (new Date()).getTime().toString());
					}
					else
					{
						log.info('"%s" not cached', key);
						callback(toCache(res, key, mimeType));
					}
				});
			}
			else
			{
				callback(toCache(res, key, mimeType));
			}
		};

		/**
		 * Display "not found" page
		 * @param {string} [title]
		 */
		res.notFound = function(title)
		{
			log.warn('"%s" matches no view', title);

			title = (title) ? '“' + title + '” Was Not Found' : 'Not Found';

			res.render('search',
				{
					'sets': Metadata.current.items,
					'title': title,
					'setting': Setting
				});
		};

		next();
	}
};

/**
 * @param res
 * @param {string} key
 * @param {string} mimeType
 */
function toCache(res, key, mimeType)
{
	return function(view, options)
	{
		if (!options.description && options.hasOwnProperty('setting'))
		{
			options.description = options.setting.description;
		}

		res.render(res, options, function(err, text)
		{
//				text = htmlMinify(text,
//				{
//					removeComments: false,
//					collapseWhitespace: false,
//					removeEmptyAttributes: true
//				});

			compress.gzip(text, function(err, buffer)
			{
				if (Setting.cacheOutput)
				{
					db.add(key, 'buffer', buffer);
					db.add(key, 'eTag', key);
				}
				sendCompressed(res, mimeType, buffer, key);
			});
		});
	}
};

/**
 * @param res
 * @param {String} mimeType
 * @param {Buffer} buffer
 * @param {String} eTag
 */
function sendCompressed(res, mimeType, buffer, eTag)
{
	"use strict";

	res.setHeader('Content-Encoding', 'gzip');
	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('ETag', eTag);
	res.setHeader('Content-Type', mimeType + ';charset=utf-8');
	res.write(buffer);
	res.end();
}