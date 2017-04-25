import { Blog, Cache } from './types';
import is from './is';
import log from './logger';
import config from './config';
import util from './util';
import cache from './cache';
import { header, httpStatus, mimeType, encoding } from './constants';
import fetch from 'node-fetch';
import template from './template';

const cacheKey = 'spam-referer';
/**
 * Last time in milliseconds that black list was downloaded
 */
let lastUpdate = 0;
let blackList:string[] = [];
/**
 * Pending black list lookup callbacks
 */
let pending:Function[] = [];
let isDownloading = false;


function blockSpamReferers(req:Blog.Request, res:Blog.Response, next:Function) {
   const referer = req.get('referer');

   if (is.value(referer)) {
      checkBlackList(util.topDomain(referer)).then(spam => {
         if (spam) {
            log.warnIcon('fingerprint', 'Spam blocked %s referer', referer);
            res.status(httpStatus.NOT_FOUND).end();
         } else {
            next();
         }
      });
   } else {
      next();
   }
}

function checkBlackList(domain:string):Promise<any> {
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
 */
const isStale = ()=> lastUpdate === 0 || (
   config.referralSpam.updateFrequency > 0 &&
   (new Date().getTime() - lastUpdate  > config.referralSpam.updateFrequency)
);

function downloadBlackList():Promise<any> {
   if (isDownloading) {
      log.info('Spam referral black list is already downloading');
      return new Promise(resolve => { pending.push(resolve); });
   } else {
      isDownloading = true;
      log.infoIcon('cloud_download', 'Downloading spam referral black list');

      return fetch(config.referralSpam.listUrl)
         .then(res => {
            if (res.status != httpStatus.OK) {
               log.error('%s returned status %s', config.referralSpam.listUrl, res.status);
               return null;
            } else {
               return res.text();
            }
         })
         .then(body => {
            let list:string[] = [];

            if (is.value(body)) {
               // list of non-empty lines
               list = body.split('\n').filter(i => !is.empty(i));
               lastUpdate = new Date().getTime();
            }
            isDownloading = false;

            if (is.array(list) && list.length > 0) {
               // execute pending callbacks
               for (const c of pending) { c(list); }
               pending = [];
               log.infoIcon('block', 'Downloaded %d blocked domains', list.length);
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

/**
 * Express middleware: add expando methods to response and request objects.
 */
function enableStatusHelpers(req:Blog.Request, res:Blog.Response, next:Function) {
   req.clientIP = () => {
      let ipAddress = req.connection.remoteAddress;
      const forwardedIP = req.header('x-forwarded-for');

      if (!is.empty(forwardedIP)) {
         // contains delimited list like "client IP, proxy 1 IP, proxy 2 IP"
         const parts = forwardedIP.split(',');
         ipAddress = parts[0];
      }
      return util.IPv6(ipAddress);
   };

   res.notFound = ()=> {
      log.warnIcon('report_problem', `${req.originalUrl} not found for ${req.clientIP()}`);
      res.status(httpStatus.NOT_FOUND);
      res.render(template.page.NOT_FOUND, { title: 'Page Not Found', config: config });
   };

   res.internalError = (err?:Error) => {
      if (is.value(err)) { log.error(err); }
      res.status(httpStatus.INTERNAL_ERROR);
      res.render(template.page.INTERNAL_ERROR, { title: 'Oops', config: config });
   };

   // JSON helpers depend on Express .json() extension and standard response structure
   res.jsonError = (message:string) => { res.json({ success: false, message }); };
   res.jsonMessage = (message:string) => {
      res.json({
         success: true,
         message: is.value(message) ? message : ''
      });
   };

   next();
}

/**
 * Express middleware: add response methods to cache and compress output
 */
function enableViewCache(req:Blog.Request, res:Blog.Response, next:Function) {
   res.sendView = (key:string, p2:string|Function|object, p3?:Function) => {
      const type = is.text(p2) ? p2 as string : mimeType.HTML;
      const optionsOrGenerator:object|Function = is.value(p3) ? p3 : p2 as object|Function;
      checkCache(res, key, type, optionsOrGenerator);
   };

   res.sendJson = (key:string, generator:Function) => {
      checkCache(res, key, mimeType.JSON, generator);
   };

   res.sendCompressed = (mimeType:string, item:Cache.Item, cache = true) => {
      res.setHeader(header.content.ENCODING, encoding.GZIP);

      if (cache) {
         res.setHeader(header.CACHE_CONTROL, 'max-age=86400, public');    // seconds
      } else {
         // force no caching
         res.setHeader(header.CACHE_CONTROL, 'no-cache');
         res.setHeader(header.EXPIRES, 'Tue, 01 Jan 1980 1:00:00 GMT');
         res.setHeader(header.PRAGMA, 'no-cache');
      }
      res.setHeader(header.E_TAG, item.eTag);
      res.setHeader(header.content.TYPE, mimeType + ';charset=utf-8');
      res.write(item.buffer);
      res.end();
   };

   next();
}

/**
 * Send content if it's cached, otherwise generate with callback
 */
function checkCache(res:Blog.Response, slug:string, mimeType:string, generator:Function|object) {
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
 */
function prepare(res:Blog.Response, slug:string, type:string, generator:Function|object) {
   if (type === mimeType.JSON) {
      // callback method directly generates output
      cacheAndSend(res, JSON.stringify(generator()), slug, type);
   } else if (is.callable(generator)) {
      // pass view renderer back to generator function to execute
      generator(makeRenderer(res, slug, type));
   } else {
      // invoke renderer directly, assuming view name identical to slug
      const options = generator;
      const render = makeRenderer(res, slug, type);
      render(slug, options);
   }
}

/**
 * Create function to render view identified by the slug then compress and
 * cache it
 */
function makeRenderer(res:Blog.Response, slug:string, type:string) {
   return (view:string, options:{[key:string]:any}, postProcess?:Function) => {
      // use default meta tag description if none provided
      if (is.empty(options.description)) { options.description = config.site.description; }
      // always send config to views
      options.config = config;

      res.render(view, options, (renderError:Error, text:string) => {
         if (is.value(renderError)) {
            // error message includes view name
            log.error('Rendering %s %s', slug, renderError.message, renderError);
            res.internalError();
         } else {
            if (is.callable(postProcess)) { text = postProcess(text); }
            cacheAndSend(res, text, slug, type);
         }
      });
   };
}

/**
 * Compress, cache and send content to client
 */
function cacheAndSend(res:Blog.Response, html:string, slug:string, type:string) {
   cache.view.add(slug, html)
      .then(item => { res.sendCompressed(type, item); })
      .catch((err:Error) => {
         // log error and send uncompressed content
         log.error('cacheAndSend() failed to add %s view to cache: %s', slug, err.toString());
         res.write(html);
         res.end();
      });
}

export default {
   blockSpamReferers,
   enableStatusHelpers,
   enableViewCache,
   spamBlackListCacheKey: cacheKey
};