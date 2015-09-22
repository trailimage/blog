'use strict';

/** @see http://nodejs.org/api/zlib.html */
var compress = require('zlib');
var Enum = require('./enum.js');
var is = require('./is.js');
var setting = require('./settings.js');
var db = require('./adapters/hash.js');
var log = require('winston');
const key = 'output';

/**
 * Cache compressed page renders in a hash key with fields named for the page slug
 * @returns {Function}
 */
module.exports = () => {
	return (req, res, next) => {
		/**
		 * Load output from cache or return renderer that will cache the output
		 * @param {string} slug Pages are cached with their slug
		 * @param {string|function|object} p2
		 * @param {function} [p3] Method called if item is not cached
		 */
		res.sendView = (slug, p2, p3) => {
			let mimeType = (typeof p2 == 'string') ? p2 : Enum.mimeType.html;
			let optcall = (p3 === undefined) ? p2 : p3;
			sendContent(slug, mimeType, optcall);
		};

		/**
		 * Load JSON output from cache or call method to build JSON
		 * @param {string} slug
		 * @param {function} render Method to build JSON if not cached
		 */
		res.sendJson = (slug, render) => {
			sendContent(slug, Enum.mimeType.json, render);
		};

		/**
		 * Display "not found" page
		 */
		res.notFound = () => {
			log.warn(`${req.originalUrl} not found for ${req.connection.remoteAddress}`);
			res.render('404', {'title': 'Page Not Found', 'setting': setting });
		};

		/**
		 * All keys for cached outputs
		 * @param {function(String[])} callback
		 */
		res.cacheKeys = callback => { db.keys(key, callback); };

		/**
		 * Remove items from output cache
		 * @param {String[]} keys
		 * @param {function(boolean)} [callback]
		 */
		res.deleteKeys = (keys, callback) => { db.remove(key, keys, callback); };

		/**
		 * Set headers and write bytes to response
		 * @param {String} mimeType
		 * @param {Buffer} buffer
		 * @param {String} eTag
		 * @param {Boolean} [cache] Whether to send caching headers (default true)
		 * @see http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
		 */
		res.sendCompressed = (mimeType, buffer, eTag, cache) => {
			if (cache === undefined) { cache = true; }

			res.setHeader('Content-Encoding', 'gzip');

			if (cache) {
				res.setHeader('Cache-Control', 'max-age=86400, public');    // seconds
			} else {
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
 * @param {String} slug
 * @param {String} mimeType
 * @param {function|Object} render
 */
function sendContent(slug, mimeType, render) {
	if (setting.cacheOutput) {
		db.getObject(key, slug, item => {
			if (item !== null) {
				// send cached item directly
				res.sendCompressed(mimeType, new Buffer(item.buffer, 'hex'), item.eTag);
			} else {
				// render content to send
				log.info(`"${slug}" not cached`);
				packageContent(res, slug, mimeType, render);
			}
		});
	} else {
		log.warn(`Caching disabled for "${slug}"`);
		packageContent(res, slug, mimeType, render);
	}
}

/**
 * Return closure function that will compress and cache the rendered output
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 * @param {function|object} render Callback or options (never needed simultaneously)
 */
function packageContent(res, slug, mimeType, render) {
	if (mimeType === Enum.mimeType.json) {
		cacheAndSend(JSON.stringify(render()), slug, mimeType);
	} else if (is.callable(render)) {
		render(renderView(res, slug, mimeType));
	} else {
		// assume simple scenario where view name is identical to slug -- render directly
		renderView(res, slug, mimeType)(slug, render);
	}
}

/**
 * Return closure function to capture, compress and cache rendered content
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 * @return {Function}
 */
function renderView(res, slug, mimeType) {
	return (view, options) => {
		// use default meta tag description if none provided
		if (!options.description) { options.description = setting.description; }
		options.setting = setting;

		res.render(view, options, (renderError, text) => {
			if (renderError) {
				log.error(`Rendering “${view}”: ${renderError.toString()}`);
				res.statusCode = Enum.httpStatus.internalError;
			} else {
				cacheAndSend(text, slug, mimeType);
			}
		});
	}
}

/**
 * Compress, optionally cache and send content to client
 * @param {String} text
 * @param slug
 * @param mimeType
 */
function cacheAndSend(text, slug, mimeType) {
	compress.gzip(text, (err, buffer) => {
		if (setting.cacheOutput) {
			db.add(key, slug, {
				'buffer': buffer.toString('hex'),
				'eTag': slug + (new Date()).getTime().toString()
			});
		}
		res.sendCompressed(mimeType, buffer, slug);
	});
}