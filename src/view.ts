import { Header, HttpStatus, MimeType, Encoding, is } from '@toba/tools';
import { Response, Request } from 'express';
import { Page } from './template';

/**
 * Remove IPv6 prefix from transitional addresses.
 *
 * https://en.wikipedia.org/wiki/IPv6_address
 */
export const IPv6 = (ip: string) =>
   is.empty(ip) || ip === '::1'
      ? '127.0.0.1'
      : ip.replace(/^::[0123456789abcdef]{4}:/g, '');

/**
 * Return normalized client IP address.
 */
export function clientIP(req: Request) {
   let ipAddress = req.connection.remoteAddress;
   const forwardedIP = req.headers[Header.ForwardedFor] as string;

   if (!is.empty(forwardedIP)) {
      // contains delimited list like "client IP, proxy 1 IP, proxy 2 IP"
      const parts = forwardedIP.split(',');
      ipAddress = parts[0];
   }
   return IPv6(ipAddress);
}

/**
 * Render standard 404 page.
 */
export function notFound(req: Request, res: Response) {
   log.warn(`${req.originalUrl} not found for ${clientIP(req)}`);
   res.statusCode = HttpStatus.NotFound;
   res.render(Page.NotFound, { title: 'Page Not Found', config });
}

export function internalError(res: Response, err?: Error) {
   if (is.value(err)) {
      log.error(err);
   }
   res.statusCode = HttpStatus.InternalError;
   res.render(Page.InternalError, { title: 'Oops', config });
}

/**
 * JSON helpers depend on Express .json() extension and standard response
 * structure.
 */
export function jsonError(res: Response, message: string) {
   res.json({ success: false, message } as JsonResponse);
}

export function jsonMessage(res: Response, message: string) {
   res.json({
      success: true,
      message: is.value(message) ? message : ''
   } as JsonResponse);
}

export function sendJson(res: Response, key: string, generate: Function) {
   sendFromCacheOrRender(res, key, {
      mimeType: MimeType.JSON,
      generate
   } as Blog.RenderOptions);
}

export function sendView(
   res: Response,
   key: string,
   options: Blog.RenderOptions
) {
   if (!options.mimeType) {
      options.mimeType = MimeType.HTML;
   }
   sendFromCacheOrRender(res, key, options);
}

export function sendCompressed(
   res: Response,
   mimeType: MimeType,
   item: Cache.Item,
   cache = true
) {
   res.setHeader(Header.Content.Encoding, Encoding.GZip);

   if (cache) {
      res.setHeader(Header.CacheControl, 'max-age=86400, public'); // seconds
   } else {
      // force no caching
      res.setHeader(Header.CacheControl, 'no-cache');
      res.setHeader(Header.Expires, 'Tue, 01 Jan 1980 1:00:00 GMT');
      res.setHeader(Header.PRAGMA, 'no-cache');
   }
   res.setHeader(Header.eTag, item.eTag);
   res.setHeader(Header.Content.Type, mimeType + ';charset=utf-8');
   res.write(item.buffer);
   res.end();
}

/**
 * Send content if it's cached otherwise generate with callback.
 */
function sendFromCacheOrRender(
   res: Response,
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
               sendCompressed(res, options.mimeType, item);
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
   res: Response,
   slug: string,
   options: Blog.RenderOptions
) {
   if (
      [MimeType.JSON, MimeType.JSONP].indexOf(options.mimeType) >= 0 &&
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
   res: Response,
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
            internalError(res);
         } else {
            if (is.callable(postProcess)) {
               text = postProcess(text);
            }
            if (is.value(text)) {
               cacheAndSend(res, text, slug, type);
            } else {
               log.error('renderTemplate(%s) returned no content', slug);
               internalError(res);
            }
         }
      });
   };
}

/**
 * Compress, cache and send content to client.
 */
function cacheAndSend(
   res: Response,
   html: string,
   slug: string,
   type: MimeType
) {
   cache.view
      .add(slug, html)
      .then(item => {
         sendCompressed(res, type, item);
      })
      .catch((err: Error) => {
         // log error and send uncompressed content
         log.error(
            `cacheAndSend() failed to add ${slug} view to cache: ${err}`
         );
         res.write(html);
         res.end();
      });
}
