import { JsonLD, serialize } from '@toba/json-ld';
import { log } from '@toba/logger';
import { Cache, Encoding, Header, HttpStatus, MimeType, is } from '@toba/tools';
import { Request, Response } from 'express';
import * as uglify from 'uglify-js';
import * as compress from 'zlib';
import { config } from '../config';
import { Layout, Page } from './template';

/**
 * Values available within view template.
 */
export interface ViewContext {
   [key: string]: any;
   /** Text rendered with `<title/>` tags. */
   title?: string;
   subtitle?: string;
   /** Link Data JSON that's serialized to page. */
   jsonLD?: JsonLD.Thing;
   /** Name of layout to use or `null` to render view only. */
   layout?: string;
}

/**
 * Rendered page cache.
 */
export const cache = new Cache<ViewItem>();

export interface ViewItem {
   /**
    * Entity Tag used to validate cache contents.
    * @see https://en.wikipedia.org/wiki/HTTP_ETag
    */
   eTag: string;
   /** GZipped view content. */
   buffer: Buffer;
   /** Mime Type to set in response header. */
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
   /**
    * Whether to minify the rendered view — generally applicable only to
    * JavaScript views.
    */
   minify?: boolean
) => void;

/**
 * Compact text by removing whitespace and more. If an error occurs then the
 * original text is returned unchanged.
 *
 * @see https://github.com/mishoo/UglifyJS2
 */
export function compact(text: string, options?: uglify.MinifyOptions): string {
   const output = uglify.minify(text, options);
   if (output.error) {
      log.error(output.error);
      return text;
   } else {
      return output.code;
   }
}

/**
 * Create view item with eTag and compressed content for cache persistence.
 *
 * @param mimeType Optionally set an explicit content type otherwise it will
 * be inferred
 *
 * @see http://nodejs.org/api/zlib.html
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
 * Normalize client IP address for error logs.
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

/**
 * Render status `500` page.
 */
function internalError(res: Response, err?: Error): void {
   if (is.value(err)) {
      log.error(err);
   }
   res.statusCode = HttpStatus.InternalError;
   res.render(Page.InternalError, { title: 'Oops', config });
}

/**
 * Send rendered view in HTTP response.
 * @param viewName View name and cache key
 * @param context Values available within view template
 * @param type Optional mime type set in response header
 */
function send(
   res: Response,
   viewName: string,
   context: ViewContext,
   type?: MimeType,
   minify?: boolean
): void;

/**
 * Send rendered view in HTTP response.
 * @param slug Cache key
 * @param fallback Method to create context and render view if not cached
 */
function send(
   res: Response,
   slug: string,
   fallback: (renderer: Renderer) => void
): void;

function send(
   res: Response,
   slug: string,
   fallbackOrContext: (renderer: Renderer) => void | ViewContext,
   type?: MimeType,
   minify = false
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

   const renderer = makeRenderer(res, slug);

   if (is.callable(fallbackOrContext)) {
      fallbackOrContext(renderer);
   } else {
      renderer(slug, fallbackOrContext, type, minify);
   }
}

/**
 * Send view item buffer as compressed response body.
 */
export function sendItem(res: Response, item: ViewItem, cache = true) {
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
      minify = false
   ) => {
      // use default meta tag description if none provided
      if (is.empty(context.description)) {
         context.description = config.site.description;
      }

      if (!is.defined(context, 'layout')) {
         context.layout = Layout.None;
      }

      if (is.defined(context, 'jsonLD')) {
         context.thing = serialize(context.jsonLD);
      }

      // always send full config to views
      context.config = config;

      res.render(view, context, (renderError: Error, text: string) => {
         if (is.value(renderError)) {
            // error message includes view name
            log.error(`Rendering ${slug} ${renderError.message}`, { slug });
            internalError(res);
         } else {
            if (is.value<string>(text)) {
               if (minify) {
                  text = compact(text);
               }
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
