import {
   Cache,
   Encoding,
   Header,
   HttpStatus,
   MimeType,
   is,
   merge
} from '@toba/tools';
import { Request, Response } from 'express';
// http://nodejs.org/api/zlib.html
import * as compress from 'zlib';
import { config } from '../config';
import { Page } from './template';

const cache = new Cache<ViewItem>();

export interface ViewItem {
   eTag: string;
   buffer: Buffer;
}

export interface RenderOptions {
   /**
    * Defaults to HTML if not specified
    */
   mimeType?: MimeType;
   /**
    * Method to generate response content if not found in cache.
    */
   generate?: () => string;
   /**
    * Key-values sent into the view tempate.
    */
   context?: { [key: string]: any };
   /**
    * Method to generate content if not in cache.
    */
   callback?: (renderer: Renderer) => void;
}

export type Renderer = (
   viewName: string,
   /** Key-values sent into the view template. */
   context: { [key: string]: any },
   /** Optional method to post-process rendered template. */
   postProcess?: (text: string) => string
) => void;

const defaultRenderOptions: RenderOptions = {
   mimeType: MimeType.HTML
};

/**
 * Create view cache item with eTag and compressed content.
 */
const createViewItem = (
   key: string,
   htmlOrJSON: string | GeoJSON.FeatureCollection<any>
) =>
   new Promise<ViewItem>((resolve, reject) => {
      const text: string =
         typeof htmlOrJSON == is.Type.Object
            ? JSON.stringify(htmlOrJSON)
            : (htmlOrJSON as string);

      compress.gzip(Buffer.from(text), (err: Error, buffer: Buffer) => {
         if (is.value(err)) {
            reject(err);
         } else {
            resolve({
               buffer,
               eTag: key + '_' + new Date().getTime().toString()
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
 * Normalized client IP address.
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
   log.warn(`${req.originalUrl} not found for ${clientIP(req)}`);
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
 * JSON helpers depend on Express .json() extension and standard response
 * structure.
 */
// function jsonError(res: Response, message: string): void {
//    res.json({ success: false, message } as JsonResponse);
// }

// function jsonMessage(res: Response, message: string) {
//    res.json({
//       success: true,
//       message: is.value(message) ? message : ''
//    } as JsonResponse);
// }

function sendJson(res: Response, key: string, generate: () => void) {
   sendFromCacheOrRender(res, key, {
      mimeType: MimeType.JSON,
      generate
   } as RenderOptions);
}

/**
 * Send rendered view in HTTP response.
 * @param key Cache key
 */
function sendView(res: Response, key: string, options: RenderOptions) {
   sendFromCacheOrRender(res, key, merge(defaultRenderOptions, options));
}

/**
 * Send view item buffer as compressed response body.
 */
function sendCompressed(
   res: Response,
   mimeType: MimeType,
   item: ViewItem,
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
   options: RenderOptions
) {
   // prepare fallback method to generate content depending on
   // MIME type and whether given generator is a callable function
   const generate = () => renderForType(res, slug, options);

   if (config.cache.views) {
      const item = cache.get(slug);

      if (item !== null) {
         // send cached item directly
         sendCompressed(res, options.mimeType, item);
      } else {
         // generate content to send
         log.info(`"${slug}" not cached`, slug);
         generate();
      }
   } else {
      log.warn(`Caching disabled for ${slug}`, slug);
      generate();
   }
}

/**
 * Render or generate content depending on its type then compress and cache
 * output.
 */
function renderForType(res: Response, slug: string, options: RenderOptions) {
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
      render(slug, options.context);
   }
}

/**
 * Curry standard function to render the view identified by the slug then
 * compress and cache it.
 */
function renderTemplate(res: Response, slug: string, type: MimeType): Renderer {
   return (
      view: string,
      context: { [key: string]: any },
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
            if (is.value(text)) {
               cacheAndSend(res, text, slug, type);
            } else {
               log.error(`renderTemplate(${slug}) returned no content`, slug);
               internalError(res);
            }
         }
      });
   };
}

/**
 * Compress, cache and send content to client.
 */
async function cacheAndSend(
   res: Response,
   html: string,
   slug: string,
   type: MimeType
) {
   const item = await createViewItem(slug, html);
   cache.add(slug, item);
   sendCompressed(res, type, item);
}

export const view = {
   send: sendView,
   sendCompressed,
   notFound,
   internalError,
   json: {
      // error: jsonError,
      // message: jsonMessage,
      send: sendJson
   }
};
