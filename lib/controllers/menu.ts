import { log } from '@toba/logger';
import { MimeType } from '@toba/tools';
import { blog } from '@trailimage/models';
import { Request, Response } from 'express';
import * as uglify from 'uglify-js';
import { config } from '../config';
import { Layout, Page, view } from '../views/';

/**
 * Minify menu JSON for production. Set `config.testing = true` if testing
 * with the production flag enabled to avoid uglifying the mock response.
 *
 * @see https://npmjs.org/package/uglify-js
 */
export function data(_req: Request, res: Response) {
   const slug = Page.PostMenuData;
   const postProcess =
      config.isProduction && !config.testing
         ? (text: string) => {
              const result = uglify.minify(text);
              if (result.error) {
                 log.error(result.error);
                 return null;
              } else {
                 return result.code;
              }
           }
         : null;

   res.setHeader('Vary', 'Accept-Encoding');
   view.send(res, slug, {
      mimeType: MimeType.JSONP,
      callback: render => {
         render(slug, { blog, layout: Layout.None }, postProcess);
      }
   });
}

export function mobile(_req: Request, res: Response) {
   const slug = Page.MobileMenuData;
   view.send(res, slug, {
      callback: render => {
         render(slug, { blog, layout: Layout.None });
      }
   });
}

export const menu = { mobile, data };
