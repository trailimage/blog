import { Blog, Cache } from '../types/';
import is from '../is';
import log from '../logger';
import config from '../config';
import cache from '../cache';
import { header, mimeType, encoding } from '../constants';

/**
 * Express middleware: add response methods to cache and compress output.
 */
export function enableViewCache(
   _req: Blog.Request,
   res: Blog.Response,
   next: Function
) {
   res.sendView = (key: string, options: Blog.RenderOptions) => {
      if (!options.mimeType) {
         options.mimeType = mimeType.HTML;
      }
      sendFromCacheOrRender(res, key, options);
   };

   res.sendJson = (key: string, generate: Function) => {
      sendFromCacheOrRender(res, key, {
         mimeType: mimeType.JSON,
         generate
      } as Blog.RenderOptions);
   };

   res.sendCompressed = (mimeType: string, item: Cache.Item, cache = true) => {
      res.setHeader(header.content.ENCODING, encoding.GZIP);

      if (cache) {
         res.setHeader(header.CACHE_CONTROL, 'max-age=86400, public'); // seconds
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
 * Send content if it's cached otherwise generate with callback.
 */
function sendFromCacheOrRender(
   res: Blog.Response,
   slug: string,
   options: Blog.RenderOptions
) {
   // prepare fallback method to generate content depending on
   // MIME type and whether given generator is a callable function
   const generate = () => renderForType(res, slug, options);

   if (config.cache.views) {
      cache.view
         .getItem(slug)
         .then(item => {
            if (is.cacheItem(item)) {
               // send cached item directly
               res.sendCompressed(options.mimeType, item);
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
 * Render or generate content depending on its type then compress and cache
 * output.
 */
function renderForType(
   res: Blog.Response,
   slug: string,
   options: Blog.RenderOptions
) {
   if (
      [mimeType.JSON, mimeType.JSONP].indexOf(options.mimeType) >= 0 &&
      is.callable(options.generate)
   ) {
      // JSON content always supplies a generate method
      cacheAndSend(
         res,
         JSON.stringify(options.generate()),
         slug,
         options.mimeType
      );
   } else if (is.callable(options.callback)) {
      // pass view renderer back to generator function to execute
      options.callback(renderTemplate(res, slug, options.mimeType));
   } else {
      // invoke renderer directly assuming view name identical to slug
      const render = renderTemplate(res, slug, options.mimeType);
      render(slug, options.templateValues);
   }
}

/**
 * Curry standard function to render the view identified by the slug then
 * compress and cache it.
 */
function renderTemplate(
   res: Blog.Response,
   slug: string,
   type: string
): Blog.Renderer {
   return (
      view: string,
      options: { [key: string]: any },
      postProcess?: Function
   ) => {
      // use default meta tag description if none provided
      if (is.empty(options.description)) {
         options.description = config.site.description;
      }
      // always send config to views
      options.config = config;

      res.render(view, options, (renderError: Error, text: string) => {
         if (is.value(renderError)) {
            // error message includes view name
            log.error(
               'Rendering %s %s',
               slug,
               renderError.message,
               renderError
            );
            res.internalError();
         } else {
            if (is.callable(postProcess)) {
               text = postProcess(text);
            }
            if (is.value(text)) {
               cacheAndSend(res, text, slug, type);
            } else {
               log.error('renderTemplate(%s) returned no content', slug);
               res.internalError();
            }
         }
      });
   };
}

/**
 * Compress, cache and send content to client.
 */
function cacheAndSend(
   res: Blog.Response,
   html: string,
   slug: string,
   type: string
) {
   cache.view
      .add(slug, html)
      .then(item => {
         res.sendCompressed(type, item);
      })
      .catch((err: Error) => {
         // log error and send uncompressed content
         log.error(
            'cacheAndSend() failed to add %s view to cache: %s',
            slug,
            err.toString()
         );
         res.write(html);
         res.end();
      });
}
