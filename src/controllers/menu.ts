import { Blog } from '../types/';
import config from '../config';
import log from '../logger';
import { layout, page } from '../template';
import library from '../library';
import { mimeType } from '../constants';
import * as uglify from 'uglify-js';

/**
 * Minify menu JSON for production. Set `config.testing = true` if testing
 * with the production flag enabled to avoid uglifying the mock response.
 *
 * https://npmjs.org/package/uglify-js
 */
function data(req:Blog.Request, res:Blog.Response)  {
   const slug = page.POST_MENU_DATA;
   const postProcess = (config.isProduction && !config.testing)
      ? (text:string) => {
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
   res.sendView(slug, {
      mimeType: mimeType.JSONP,
      callback: render => {
         render(slug, { library, layout: layout.NONE }, postProcess);
      }
   });
}

function mobile(req:Blog.Request, res:Blog.Response) {
   const slug = page.MOBILE_MENU_DATA;
   res.sendView(slug, {
      callback: render => { render(slug, { library, layout: layout.NONE }); }
   });
}

export default { data, mobile };