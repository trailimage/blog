/** @see http://nodejs.org/api/zlib.html */
var compress = require('zlib');
var Enum = require('./enum.js');
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
			var optcall = (p3 === undefined) ? p2 : p3;

			if (setting.cacheOutput)
			{
				db.getObject(key, slug, function(item)
				{
					if (item != null)
					{
						res.sendCompressed(mimeType, new Buffer(item.buffer, 'hex'), item.eTag);
					}
					else
					{
						log.info('"%s" not cached', slug);
						notCached(res, slug, mimeType, optcall);
					}
				});
			}
			else
			{
				log.warn('Caching disabled for "%s"', slug);
				notCached(res, slug, mimeType, optcall);
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

		/**
		 * Remove items from output cache
		 * @param {String[]} keys
		 * @param {function(boolean)} [callback]
		 */
		res.deleteKeys = function(keys, callback) { db.remove(key, keys, callback); };

		/**
		 * Set headers and write bytes to response
		 * @param {String} mimeType
		 * @param {Buffer} buffer
		 * @param {String} eTag
		 * @param {Boolean} [cache] Whether to send caching headers (default true)
		 * @see http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
		 */
		res.sendCompressed = function(mimeType, buffer, eTag, cache)
		{
			"use strict";

			if (cache === undefined) { cache = true; }

			res.setHeader('Content-Encoding', 'gzip');

			if (cache)
			{
				res.setHeader('Cache-Control', 'max-age=86400, public');    // seconds
			}
			else
			{
				res.setHeader('Cache-Control', 'max-age=0');
				res.setHeader('Cache-Control', 'no-cache');
				res.setHeader('expires', '0');
				res.setHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
				res.setHeader('pragma', 'no-cache');
			}
			res.setHeader('ETag', eTag);
			res.setHeader('Content-Type', mimeType + ';charset=utf-8');
			res.write(buffer);
			res.end();
		};

		next();
	}
};

/**
 * Return closure function that will compress and cache the rendered output
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 * @param {function|object} [optcall] Callback or options (never needed simultaneously)
 */
function notCached(res, slug, mimeType, optcall)
{
	if (optcall !== undefined && optcall instanceof Function)
	{
		optcall(cacheRenderer(res, slug, mimeType));
	}
	else
	{
		// assume simple scenario where view name is identical to slug -- render directly
		cacheRenderer(res, slug, mimeType)(slug, optcall);
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
		if (!options.description) { options.description = setting.description; }
		options.setting = setting;

		res.render(view, options, function(err, text)
		{
			if (err)
			{
				log.error('Rendering “%s”: %s', view, err.toString());
				res.statusCode = Enum.httpStatus.internalError;
			}
			else
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
					res.sendCompressed(mimeType, buffer, slug);
				});
			}
		});
	}
}