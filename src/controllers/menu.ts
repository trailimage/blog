import { photoBlog } from '../models/index';
import { Blog } from '../types/';
import config from '../config';
//import log from "../logger";
import { Layout, page } from '../template';
import { MimeType } from '@toba/tools';
import * as uglify from 'uglify-js';

/**
 * Minify menu JSON for production. Set `config.testing = true` if testing
 * with the production flag enabled to avoid uglifying the mock response.
 *
 * https://npmjs.org/package/uglify-js
 */
function data(_req: Blog.Request, res: Blog.Response) {
   const slug = page.POST_MENU_DATA;
   const postProcess =
      config.isProduction && !config.testing
         ? (text: string) => {
              const result = uglify.minify(text);
              // if (result.error) {
              //    log.error(result.error);
              //    return null;
              // } else {
              return result.code;
              // }
           }
         : null;

   res.setHeader('Vary', 'Accept-Encoding');
   res.sendView(slug, {
      mimeType: MimeType.JSONP,
      callback: render => {
         render(slug, { photoBlog, layout: Layout.None }, postProcess);
      }
   });
}

function mobile(_req: Blog.Request, res: Blog.Response) {
   const slug = page.MOBILE_MENU_DATA;
   res.sendView(slug, {
      callback: render => {
         render(slug, { photoBlog, layout: Layout.None });
      }
   });
}

export default { data, mobile };
