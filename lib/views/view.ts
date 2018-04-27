import { Cache, Encoding, Header, HttpStatus, MimeType, is } from '@toba/tools';
import { log } from '@toba/logger';
import { Request, Response } from 'express';
// http://nodejs.org/api/zlib.html
import * as compress from 'zlib';
import { config } from '../config';
import { Page } from './template';

export type ViewContext = { [key: string]: any };

/**
 * Rendered page cache.
 */
export const cache = new Cache<ViewItem>();

export interface ViewItem {
   eTag: string;
   buffer: Buffer;
   type: MimeType;
}

/**
 * Method to render an HTML view with context and optional post-processing.
 */
export type Renderer = (
   viewName: string,
   /** Key-values sent into the view template. */
   context: ViewContext,
   type?: MimeType,
   /** Optional method to post-process rendered template. */
   postProcess?: (text: string) => string
) => void;

/**
 * Create view item with eTag and compressed content for cache persistence.
 *
 * @param mimeType Optionally set an explicit content type otherwise it will
 * be inferred
 */
export const createViewItem = (
   key: string,
   htmlOrJSON: string | GeoJSON.FeatureCollection<any>,
   type?: MimeType
) =>
   new Promise<ViewItem>((resolve, reject) => {
      let text: string;
      let inferredType: MimeType;

      if (is.text(htmlOrJSON)) {
         text = htmlOrJSON;
         inferredType = MimeType.HTML;
      } else {
         text = JSON.stringify(htmlOrJSON);
         inferredType = MimeType.JSON;
      }
      if (type === undefined) {
         type = inferredType;
      }

      compress.gzip(Buffer.from(text), (err: Error, buffer: Buffer) => {
         if (is.value(err)) {
            reject(err);
            log.error(err, { slug: key });
         } else {
            resolve({
               buffer,
               eTag: key + '_' + new Date().getTime().toString(),
               type
            });
         }
      });
   });

/**
 * Remove IPv6 prefix from transitional addresses.
 *
 * @see https://en.wikipedia.org/wiki/IPv6_address
 */
export const IPv6 = (ip: string): string =>
   is.empty(ip) || ip === '::1'
      ? '127.0.0.1'
      : ip.replace(/^::[0123456789abcdef]{4}:/g, '');

/**
 * Normalized client IP address for use in error logs.
 */
export function clientIP(req: Request): string {
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
export function notFound(req: Request, res: Response): void {
   const ip = clientIP(req);
   log.warn(`${req.originalUrl} not found for ${ip}`, { clientIP: ip });
   res.statusCode = HttpStatus.NotFound;
   res.render(Page.NotFound, { title: 'Page Not Found', config });
}

function internalError(res: Response, err?: Error): void {
   if (is.value(err)) {
      log.error(err);
   }
   res.statusCode = HttpStatus.InternalError;
   res.render(Page.InternalError, { title: 'Oops', config });
}

/**
 * Send generated JSON in HTTP response.
 *
 * @param fallback Method to generate JSON if not cached
 */
// function json(res: Response, slug: string, fallback: () => any) {
//    if (config.cache.views) {
//       const item = cache.get(slug);

//       if (item !== null) {
//          // send cached item directly
//          return sendItem(res, item);
//       } else {
//          log.info(`"${slug}" not cached`, { slug });
//       }
//    } else {
//       log.warn(`Caching disabled for ${slug}`, { slug });
//    }

//    cacheAndSend(res, JSON.stringify(fallback()), slug, MimeType.JSON);
// }

/**
 * Send rendered view in HTTP response.
 * @param slug Cache key and usually the view name as well
 * @param fallback Method to create context and render view if not cached
 */
function send(
   res: Response,
   slug: string,
   fallback: (renderer: Renderer) => void
) {
   if (config.cache.views) {
      const item = cache.get(slug);

      if (item !== null) {
         // send cached item directly
         return sendItem(res, item);
      } else {
         log.info(`"${slug}" not cached`, { slug });
      }
   } else {
      log.warn(`Caching disabled for ${slug}`, { slug });
   }

   fallback(makeRenderer(res, slug));
}

/**
 * Send view item buffer as compressed response body.
 */
function sendItem(res: Response, item: ViewItem, cache = true) {
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
   res.setHeader(Header.Content.Type, item.type + ';charset=utf-8');
   res.write(item.buffer);
   res.end();
}

/**
 * Curry standard function to render the view identified by the slug then
 * compress and cache it.
 */
function makeRenderer(res: Response, slug: string): Renderer {
   return (
      view: string,
      context: ViewContext,
      type?: MimeType,
      postProcess?: (text: string) => string
   ) => {
      // use default meta tag description if none provided
      if (is.empty(context.description)) {
         context.description = config.site.description;
      }
      // always send full config to views
      context.config = config;

      res.render(view, context, (renderError: Error, text: string) => {
         if (is.value(renderError)) {
            // error message includes view name
            log.error(`Rendering ${slug} ${renderError.message}`, { slug });
            internalError(res);
         } else {
            if (is.callable(postProcess)) {
               text = postProcess(text);
            }
            if (is.value<string>(text)) {
               cacheAndSend(res, text, slug, type);
            } else {
               log.error(`renderTemplate(${slug}) returned no content`, {
                  slug
               });
               internalError(res);
            }
         }
      });
   };
}

/**
 * Compress, cache and send content to client.
 *
 * @param body HTML or JSON
 */
async function cacheAndSend(
   res: Response,
   body: string,
   slug: string,
   type?: MimeType
) {
   const item = await createViewItem(slug, body, type);
   cache.add(slug, item);
   sendItem(res, item);
}

export const view = {
   send,
   notFound,
   internalError
};
