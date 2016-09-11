'use strict';

/** @see http://nodejs.org/api/zlib.html */
const C = require('../constants');
const log = require('../logger');
const cache = require('../cache');
const config = require('../config');
const is = require('../is');
const compress = require('zlib');

/**
 * Express middleware
 * Add expando methods to response object
 * Cache compressed page renders in a hash key with fields named for the page slug
 * @returns {Function}
 */
module.exports.apply = (req, res, next) => {
	/**
	 * Load output from cache or return renderer that will capture and cache the output
	 * @param {String} slug Pages are cached with their slug
	 * @param {String|function(function)|Object} p2 MIME type, content generation function or options
	 * @param {function(function)} [p3] Content generation function if item is not cached
	 */
	res.sendView = (slug, p2, p3) => {
		const mimeType = (typeof p2 === is.type.STRING) ? p2 : C.mimeType.HTML;
		const optionsOrGenerator = (p3 === undefined) ? p2 : p3;
		checkCache(res, slug, mimeType, optionsOrGenerator);
	};

	/**
	 * Load JSON output from cache or call method to build JSON
	 * @param {String} slug
	 * @param {function} generator Method to build JSON if not cached
	 */
	res.sendJson = (slug, generator) => {
		checkCache(res, slug, C.mimeType.JSON, generator);
	};

	/**
	 * All keys for cached outputs
	 * @returns {Promise}
	 */
	res.getCacheKeys = ()=> cache.view.keys();

	/**
	 * Remove items from output cache
	 * @param {String[]|String} slugs
	 * @returns {Promise}
	 */
	res.removeFromCache = slugs => cache.view.remove(slugs);

   /**
    * Set headers and write bytes to response
    * @param {String} mimeType
    * @param {ViewCacheItem} item
    * @param {Boolean} [cache = true] Whether to send caching headers
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
 * Send content if it's cached, otherwise generate with callback
 * @param res
 * @param {String} slug
 * @param {String} mimeType
 * @param {function|Object} generator Method that generates content
 */
function checkCache(res, slug, mimeType, generator) {
   // prepare fallback method to generate content depending on
   // MIME type and whether given generator is a callable function
   const generate = ()=> prepare(res, slug, mimeType, generator);

   if (config.cache.views) {
      cache.view.item(slug)
         .then(item => {
            if (item !== null) {
               // send cached item directly
               res.sendCompressed(mimeType, item);
            } else {
               // generate content to send
               log.info('"%s" not cached', slug);
               generate();
            }
         })
         .catch(err => {
            log.error('Error loading cached view', err);
            generate();
         });
   } else {
      log.warn('Caching disabled for "%s"', slug);
      generate();
   }
}

/**
 * Create function to generate, compress and cache content
 * @param {BlogResponse} res
 * @param {String} slug
 * @param {String} mimeType
 * @param {function(function)|Object} generator Method or options (never needed simultaneously) to build content
 */
function prepare(res, slug, mimeType, generator) {
   if (mimeType === C.mimeType.JSON) {
      // callback method directly generates output
      cacheAndSend(res, JSON.stringify(generator()), slug, mimeType);
   } else if (is.callable(generator)) {
      // pass view renderer back to generator function to execute
      generator(makeRenderer(res, slug, mimeType));
   } else {
      // invoke renderer directly, assuming view name identical to slug
      let options = generator;
      let render = makeRenderer(res, slug, mimeType);
      render(slug, options);
   }
}

/**
 * Create function to render view then compress and cache it
 * @param res
 * @param {String} slug
 * @param {String} mimeType
 * @returns {function(String, Object, function)}
 */
function makeRenderer(res, slug, mimeType) {
   return (view, options, postProcess) => {
      // use default meta tag description if none provided
      if (is.empty(options.description)) { options.description = config.site.description; }
      // always send config to views
      options.config = config;

      res.render(view, options, (renderError, text) => {
         if (is.value(renderError)) {
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
 * @param {BlogResponse} res
 * @param {String} text Rendered page
 * @param {String} slug
 * @param {String} mimeType
 */
function cacheAndSend(res, text, slug, mimeType) {
   compress.gzip(text, (err, buffer) => {
      cache.view.add(slug, buffer)
         .then(()=> { res.sendCompressed(mimeType, buffer); })
         .catch(err => {
            log.error('Failed to add %s view to cache: %s', slug, err.toString());
            res.sendCompressed(mimeType, buffer);
         });
   });
}