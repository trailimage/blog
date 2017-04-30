import { Blog } from '../types/';
import config from '../config';
import { layout, page } from '../template';
import library from '../library';
import { mimeType } from '../constants';
// https://npmjs.org/package/uglify-js
import * as uglify from 'uglify-js';

function data(req:Blog.Request, res:Blog.Response)  {
   const slug = page.POST_MENU_DATA;
   // minify menu JSON for live site
   const postProcess = config.isProduction
      ? (text:string) => uglify.minify(text, { fromString: true }).code
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