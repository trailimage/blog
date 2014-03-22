/** @see http://nodejs.org/api/zlib.html */
var compress = require('zlib');
var setting = require('./settings.js');
var db = require('./adapters/hash.js');
var log = require('winston');
var key = 'output';

/**
 * Cache compressed page renders in a hash key with fields named for the page slug
 * @returns {Function}
 */
module.exports = function()
{
	return function(req, res, next)
	{
		/**
		 * Load output from cache or return renderer that will cache the output
		 * @param {string} slug Pages are cached with their slug
		 * @param {string|function|object} p2
		 * @param {function} [p3] Method called if item is not cached
		 */
		res.fromCache = function(slug, p2, p3)
		{
			var mimeType = (typeof p2 == 'string') ? p2 : 'text/html';
			var callback = (p3 === undefined) ? p2 : p3;

			if (setting.cacheOutput)
			{
				db.getObject(key, slug, function(item)
				{
					if (item != null)
					{
						sendCompressed(res, mimeType, new Buffer(item.buffer, 'hex'), item.eTag);
					}
					else
					{
						log.info('"%s" not cached', slug);
						notCached(res, slug, mimeType, callback);
					}
				});
			}
			else
			{
				notCached(res, slug, mimeType, callback);
			}
		};

		/**
		 * Display "not found" page
		 * @param {string} [title]
		 */
		res.notFound = function(title)
		{
			var library = require('./models/library.js');

			log.warn('"%s" matches no view', title);

			title = (title) ? '“' + title + '” Was Not Found' : 'Not Found';

			res.render('search',
			{
				'posts': library.posts,
				'title': title,
				'setting': setting
			});
		};

		/**
		 * All keys for cached outputs
		 * @param {function(String[])} callback
		 */
		res.cacheKeys = function(callback) { db.keys(key, callback); };

		next();
	}
};

/**
 * Return closure function that will compress and cache the rendered output
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 * @param {function|object} [callback] or view options
 */
function notCached(res, slug, mimeType, callback)
{
	if (callback !== undefined && callback instanceof Function)
	{
		callback(cacheRenderer(res, slug, mimeType));
	}
	else
	{
		// assume simple scenario where view name is identical to slug
		cacheRenderer(res, slug, mimeType)(slug, callback);
	}
}

/**
 * Return closure function to capture, compress and cache rendered content
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 */
function cacheRenderer(res, slug, mimeType)
{
	return function(view, options)
	{
		if (!options.description && options.hasOwnProperty('setting'))
		{
			// add description if none given and settings are present
			options.description = options.setting.description;
		}

		res.render(view, options, function(err, text)
		{
			compress.gzip(text, function(err, buffer)
			{
				if (setting.cacheOutput)
				{
					db.add(key, slug,
					{
						'buffer': buffer.toString('hex'),
						'eTag': slug + (new Date()).getTime().toString()
					});
				}
				sendCompressed(res, mimeType, buffer, slug);
			});
		});
	}
};

/**
 * Set headers and write bytes to response
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