'use strict';

/** @see http://nodejs.org/api/zlib.html */
const TI = require('../');
const config = TI.config;
const template = TI.template;
const CacheItem = TI.Provider.Cache.Item;
const is = TI.is;
const format = TI.format;
const db = TI.active;
const compress = require('zlib');
const key = 'output';

/**
 * Express middleware
 * Add expando methods to response object
 * Cache compressed page renders in a hash key with fields named for the page slug
 * @returns {Function}
 */
module.exports.methods = (req, res, next) => {
	/**
	 * Load output from cache or return renderer that will cache the output
	 * @param {string} slug Pages are cached with their slug
	 * @param {string|function(function)|object} p2
	 * @param {function(function)} [p3] Method called if item is not cached
	 */
	res.sendView = (slug, p2, p3) => {
		let mimeType = (typeof p2 === 'string') ? p2 : TI.mimeType.html;
		let optcall = (p3 === undefined) ? p2 : p3;
		checkCache(res, slug, mimeType, optcall);
	};

	/**
	 * Load JSON output from cache or call method to build JSON
	 * @param {string} slug
	 * @param {function} render Method to build JSON if not cached
	 */
	res.sendJson = (slug, render) => {
		checkCache(res, slug, TI.mimeType.json, render);
	};

	/**
	 * Display "not found" page
	 */
	res.notFound = () => {
		db.log.warnIcon(TI.icon.x, `${req.originalUrl} not found for ${format.IPv6(req.connection.remoteAddress)}`);
		res.status(TI.httpStatus.notFound);
		res.render(template.page.notFound, { title: 'Page Not Found', config: config });
	};

	res.internalError = () => {
		res.status(TI.httpStatus.internalError);
		res.render(template.page.internalError, { title: 'Oops', config: config });
	};

	/**
	 * All keys for cached outputs
	 * @param {function(String[])} callback
	 */
	res.cacheKeys = callback => { db.cache.keys(key, callback); };

	/**
	 * Remove items from output cache
	 * @param {String[]} keys
	 * @param {function(boolean)} [callback]
	 */
	res.removeFromCache = (keys, callback) => { db.cache.remove(key, keys, callback); };

	/**
	 * Set headers and write bytes to response
	 * @param {String} mimeType
	 * @param {CacheItem|Object} item
	 * @param {Boolean} [cache = true] Whether to send caching headers
	 * @see http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
	 */
	res.sendCompressed = (mimeType, item, cache) => {
		if (cache === undefined) { cache = true; }

		res.setHeader('Content-Encoding', 'gzip');

		if (cache) {
			res.setHeader('Cache-Control', 'max-age=86400, public');    // seconds
		} else {
			// force no caching
			res.setHeader('Cache-Control', 'no-cache');
			res.setHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
			res.setHeader('pragma', 'no-cache');
		}
		res.setHeader('ETag', item.eTag);
		res.setHeader('Content-Type', mimeType + ';charset=utf-8');
		res.write(item.buffer);
		res.end();
	};

	next();
};

// Private members ------------------------------------------------------------

/**
 * Send item if it's cached, otherwise generate it with callback
 * @param res
 * @param {String} slug
 * @param {String} mimeType
 * @param {function|Object} callback Method that generates content
 */
function checkCache(res, slug, mimeType, callback) {
	if (config.cacheOutput) {
		db.cache.getObject(key, slug, item => {
			if (item !== null) {
				// send cached item directly
				res.sendCompressed(mimeType, item);
			} else {
				// render content to send
				db.log.info('"%s" not cached', slug);
				prepare(res, slug, mimeType, callback);
			}
		});
	} else {
		db.log.warn('Caching disabled for "%s"', slug);
		prepare(res, slug, mimeType, callback);
	}
}

/**
 * Return closure function that will compress and cache the rendered output
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 * @param {function(function)|object} callback Method or options (never needed simultaneously) to build content
 */
function prepare(res, slug, mimeType, callback) {
	if (mimeType === TI.mimeType.json) {
		// callback method generates object
		cacheAndSend(res, JSON.stringify(callback()), slug, mimeType);
	} else if (is.callable(callback)) {
		// callback method invokes response.renderer, providing view name and options
		callback(makeRenderer(res, slug, mimeType));
	} else {
		// invoke renderer directly, assuming view name identical to slug
		let options = callback;
		let render = makeRenderer(res, slug, mimeType);
		render(slug, options);
	}
}

/**
 * Return closure function to capture, compress and cache rendered content
 * @param res
 * @param {string} slug
 * @param {string} mimeType
 * @return {function(String, Object)}
 */
function makeRenderer(res, slug, mimeType) {
	return (view, options, postProcess) => {
		// use default meta tag description if none provided
		if (is.empty(options.description)) { options.description = config.description; }
		// always send config to views
		options.config = config;

		res.render(view, options, (renderError, text) => {
			if (renderError) {
				// error message includes view name
				db.log.error('Rendering %s %s', slug, renderError.message, renderError);
				res.internalError();
			} else {
				if (is.callable(postProcess)) { text = postProcess(text); }
				cacheAndSend(res, text, slug, mimeType);
			}
		});
	}
}

/**
 * Compress, optionally cache and send content to client
 * @param res
 * @param {String} text
 * @param slug
 * @param mimeType
 */
function cacheAndSend(res, text, slug, mimeType) {
	compress.gzip(text, (err, buffer) => {
		let ci = new CacheItem(slug, buffer);
		if (config.cacheOutput) { db.cache.addOutput(key, slug, buffer); }
		res.sendCompressed(mimeType, ci, slug);
	});
}