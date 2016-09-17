'use strict';

const is = require('./is');
const log = require('./logger');
const config = require('./config');
const format = require('./format');
const cache = require('./cache');
const C = require('./constants');

//region Referral blocker

const fetch = require('node-fetch');
const cacheKey = 'spam-referer';
/**
 * Last time in milliseconds that black list was downloaded
 * @type Number
 */
let lastUpdate = 0;
let blackList = [];
/**
 * Pending black list lookup callbacks
 * @type {function[]}
 */
let pending = [];
let isDownloading = false;

function blockSpamReferers(req, res, next) {
   let referer = req.get('referer');

   if (is.value(referer)) {
      checkBlackList(format.topDomain(referer)).then(spam => {
         if (spam) {
            log.warnIcon(C.icon.target, 'Spam blocked %s referer', referer);
            res.status(C.httpStatus.NOT_FOUND).end();
         } else {
            next();
         }
      });
   } else {
      next();
   }
}

/**
 * @param {string} domain
 * @returns {Promise}
 */
function checkBlackList(domain) {
   if (blackList.length === 0) {
      return getBlackList().then(list => {
         blackList = list;
         return blackList.indexOf(domain) !== -1;
      });
   } else {
      if (isStale()) { downloadBlackList(); }
      return Promise.resolve(blackList.indexOf(domain) !== -1);
   }
}

/**
 * Load list from cache or remote provider
 * @returns {Promise}
 */
const getBlackList = ()=> cache.getItem(cacheKey).then(list => {
   if (is.array(list)) {
      if (isStale()) { downloadBlackList(); }
      return list;
   } else {
      return downloadBlackList();
   }
});

/**
 * Whether black list needs to be refreshed
 * @returns {boolean}
 */
const isStale = ()=> lastUpdate === 0 || (
   config.referralSpam.updateFrequency > 0 &&
   (new Date().getTime() - lastUpdate  > config.referralSpam.updateFrequency)
);

/**
 * @returns {Promise}
 */
function downloadBlackList() {
   if (isDownloading) {
      log.info('Spam referral black list is already downloading');
      return new Promise(resolve => { pending.push(resolve); });
   } else {
      isDownloading = true;
      log.infoIcon(C.icon.cloudDownload, 'Downloading spam referral black list');

      return fetch(config.referralSpam.listUrl)
         .then(res => {
            if (res.status != C.httpStatus.OK) {
               log.error('%s returned status %s', config.referralSpam.listUrl, res.status);
               return null;
            } else {
               return res.text();
            }
         })
         .then(body => {
            let list = [];

            if (is.value(body)) {
               // list of non-empty lines
               list = body.split('\n').filter(i => !is.empty(i));
               lastUpdate = new Date().getTime();
            }
            isDownloading = false;

            if (is.array(list) && list.length > 0) {
               // execute pending callbacks
               for (let c of pending) { c(list); }
               pending = [];
               log.infoIcon(C.icon.banned, 'Downloaded %d blocked domains', list.length);
               cache.add(cacheKey, list);
               return list;
            } else {
               return [];
            }
         })
         .catch(err => {
            log.error('Failed to download referer blacklist: %s', err.toString());
         });
   }
}

//endregion
//region Response status helper

const template = require('./template');

/**
 * Express middleware
 * Add expando methods to response and request objects
 * @returns {function}
 */
function enableStatusHelpers(req, res, next) {
   /**
    * Get corrected client IP
    * @returns {string}
    * @see http://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o
    */
   req.clientIP = () => {
      let ipAddress = req.connection.remoteAddress;
      let forwardedIP = req.header('x-forwarded-for');

      if (!is.empty(forwardedIP)) {
         // contains delimited list like "client IP, proxy 1 IP, proxy 2 IP"
         let parts = forwardedIP.split(',');
         ipAddress = parts[0];
      }
      return format.IPv6(ipAddress);
   };

   /**
    * Display "not found" page
    */
   res.notFound = () => {
      log.warnIcon(C.icon.x, `${req.originalUrl} not found for ${req.clientIP()}`);
      res.status(C.httpStatus.NOT_FOUND);
      res.render(template.page.NOT_FOUND, { title: 'Page Not Found', config: config });
   };

   res.internalError = err => {
      if (err !== undefined) { log.error(err); }
      res.status(C.httpStatus.INTERNAL_ERROR);
      res.render(template.page.INTERNAL_ERROR, { title: 'Oops', config: config });
   };

   // JSON helpers depend on Express .json() extension and standard response structure
   res.jsonError = message => { res.json({ success: false, message }); };
   res.jsonMessage = message => { res.json({ success: true, message }); };

   next();
}

//endregion
//region View cache

/**
 * Express middleware
 * Add expando methods to response object
 * Cache compressed page renders in a hash key with fields named for the page slug
 * @returns {Function}
 */
function enableViewCache(req, res, next) {
   /**
    * Load output from cache or return renderer that will capture and cache the output
    * @param {String} key Pages are cached with their slug
    * @param {String|function(function)|Object} p2 MIME type, content generation function or options
    * @param {function(function)} [p3] Content generation function if item is not cached
    */
   res.sendView = (key, p2, p3) => {
      const mimeType = is.text(p2) ? p2 : C.mimeType.HTML;
      const optionsOrGenerator = is.value(p3) ? p3 : p2;
      checkCache(res, key, mimeType, optionsOrGenerator);
   };

   /**
    * Load JSON output from cache or call method to build JSON
    * @param {String} key
    * @param {function} generator Method to build JSON if not cached
    */
   res.sendJson = (key, generator) => {
      checkCache(res, key, C.mimeType.JSON, generator);
   };

   /**
    * Set headers and write bytes to response
    * @param {String} mimeType
    * @param {ViewCacheItem} item
    * @param {Boolean} [cache = true] Whether to send caching headers
    * @see http://condor.depaul.edu/dmumaugh/readings/handouts/SE435/HTTP/node24.html
    */
   res.sendCompressed = (mimeType, item, cache = true) => {
      res.setHeader(C.header.content.ENCODING, C.encoding.GZIP);

      if (cache) {
         res.setHeader(C.header.CACHE_CONTROL, 'max-age=86400, public');    // seconds
      } else {
         // force no caching
         res.setHeader(C.header.CACHE_CONTROL, 'no-cache');
         res.setHeader(C.header.EXPIRES, 'Tue, 01 Jan 1980 1:00:00 GMT');
         res.setHeader(C.header.PRAGMA, 'no-cache');
      }
      res.setHeader(C.header.E_TAG, item.eTag);
      res.setHeader(C.header.content.TYPE, mimeType + ';charset=utf-8');
      res.write(item.buffer);
      res.end();
   };

   next();
}

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
      cache.view.getItem(slug)
         .then(item => {
            if (is.cacheItem(item)) {
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
 * @param res
 * @param {String} html Rendered page
 * @param {String} slug
 * @param {String} mimeType
 */
function cacheAndSend(res, html, slug, mimeType) {
   cache.view.add(slug, html)
      .then(item => { res.sendCompressed(mimeType, item); })
      .catch(err => {
         log.error('cacheAndSend() failed to add %s view to cache: %s', slug, err.toString());
         res.write(html);
         res.end();
      });
}

//endregion

module.exports = {
   blockSpamReferers,
   enableStatusHelpers,
   enableViewCache,
   spamBlackListCacheKey: cacheKey
};