import { photoBlog } from '../models/index';
import config from '../config';
//import log from "../logger";
import { Layout, Page } from '../template';
import { MimeType } from '@toba/tools';
import * as uglify from 'uglify-js';
import { Response, Request } from 'express';
import { sendView } from '../response';

/**
 * Minify menu JSON for production. Set `config.testing = true` if testing
 * with the production flag enabled to avoid uglifying the mock response.
 *
 * https://npmjs.org/package/uglify-js
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
   sendView(res, slug, {
      mimeType: MimeType.JSONP,
      callback: render => {
         render(slug, { photoBlog, layout: Layout.None }, postProcess);
      }
   });
}

export function mobile(_req: Request, res: Response) {
   const slug = Page.MobileMenuData;
   sendView(res, slug, {
      callback: render => {
         render(slug, { photoBlog, layout: Layout.None });
      }
   });
}

export const menu = { mobile, data };
