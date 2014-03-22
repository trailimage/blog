/** @see http://nodejs.org/api/zlib.html */
var compress = require('zlib');
var setting = require('./settings.js');
var db = require('./adapters/hash.js');

module.exports = function()
{
	return function(req, res, next)
	{
		/**
		 * Load output from cache or return renderer that will cache the output
		 * @param {string} key
		 * @param {string|function|object} p2
		 * @param {function} [p3] Method called if item is not cached
		 */
		res.fromCache = function(key, p2, p3)
		{
			var mimeType = (typeof p2 == 'string') ? p2 : 'text/html';
			var callback = (p3 === undefined) ? p2 : p3;

			if (setting.cacheOutput)
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
						render(res, key, mimeType, callback);
					}
				});
			}
			else
			{
				render(res, key, mimeType, callback);
			}
		};

		/**
		 * Display "not found" page
		 * @param {string} [title]
		 */
		res.notFound = function(title)
		{
			var library = require('lib/models/library.js');

			log.warn('"%s" matches no view', title);

			title = (title) ? '“' + title + '” Was Not Found' : 'Not Found';

			res.render('search',
			{
				'posts': library.posts,
				'title': title,
				'setting': setting
			});
		};

		next();
	}
};

/**
 * @param res
 * @param {string} key
 * @param {string} mimeType
 * @param {function|object} [callback] or view options
 */
function render(res, key, mimeType, callback)
{
	if (callback !== undefined && callback instanceof Function)
	{
		callback(cacher(res, key, mimeType));
	}
	else
	{
		// assume simple scenario where view name is identical to key
		cacher(res, key, mimeType)(key, callback);
	}
}

/**
 * Return function to capture, compress and cache rendered content
 * @param res
 * @param {string} key
 * @param {string} mimeType
 */
function cacher(res, key, mimeType)
{
	return function(view, options)
	{
		if (!options.description && options.hasOwnProperty('setting'))
		{
			options.description = options.setting.description;
		}

		res.render(view, options, function(err, text)
		{
			compress.gzip(text, function(err, buffer)
			{
				if (setting.cacheOutput)
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