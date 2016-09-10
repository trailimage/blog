'use strict';

/** @see http://nodejs.org/api/zlib.html */
const e = require('../constants');
const log = require('../logger');
const cache = require('../cache');
const config = require('../config');
const is = require('../is');
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
	 * Load output from cache or return renderer that will capture and cache the output
	 * @param {string} slug Pages are cached with their slug
	 * @param {string|function(function)|object} p2
	 * @param {function(function)} [p3] Method called if item is not cached
	 */
	res.sendView = (slug, p2, p3) => {
		let mimeType = (typeof p2 === is.type.STRING) ? p2 : e.mimeType.HTML;
		let optcall = (p3 === undefined) ? p2 : p3;
		checkCache(res, slug, mimeType, optcall);
	};

	/**
	 * Load JSON output from cache or call method to build JSON
	 * @param {string} slug
	 * @param {function} render Method to build JSON if not cached
	 */
	res.sendJson = (slug, render) => {
		checkCache(res, slug, e.mimeType.JSON, render);
	};

	/**
	 * All keys for cached outputs
	 * @returns {Promise}
	 */
	res.cacheKeys = () => cache.keys(key);

	/**
	 * Remove items from output cache
	 * @param {string[]|string} keys
	 * @param {function(boolean)} [callback]
	 */
	res.removeFromCache = (keys, callback) => { cache.remove(key, keys, callback); };

   /**
    * Set headers and write bytes to response
    * @param {string} mimeType
    * @param {object} item
    * @param {boolean} [cache = true] Whether to send caching headers
    * @see http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
    */
	res.sendCompressed = (mimeType, item, cache = true) => {
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

/**
 * Send item if it's cached, otherwise generate it with callback
 * @param res
 * @param {String} slug
 * @param {String} mimeType
 * @param {function|object} generator Method that generates content
 */
function checkCache(res, slug, mimeType, generator) {
   if (config.cache.views) {
      cache.getObject(key, slug).then(item => {
         if (item !== null) {
            // send cached item directly
            res.sendCompressed(mimeType, item);
         } else {
            // render content to send
            log.info('"%s" not cached', slug);
            prepare(res, slug, mimeType, generator);
         }
      });
   } else {
      log.warn('Caching disabled for "%s"', slug);
      prepare(res, slug, mimeType, generator);
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
   if (mimeType === e.mimeType.JSON) {
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
 * @returns {{function(string, object)}}
 */
function makeRenderer(res, slug, mimeType) {
   return (view, options, postProcess) => {
      // use default meta tag description if none provided
      if (is.empty(options.description)) { options.description = config.site.description; }
      // always send config to views
      options.config = config;

      res.render(view, options, (renderError, text) => {
         if (renderError) {
            // error message includes view name
            log.error('Rendering %s %s', slug, renderError.message, renderError);
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
      let ci = cache.view.add(key, slug, buffer);
      res.sendCompressed(mimeType, ci, slug);
   });
}