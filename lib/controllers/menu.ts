import config from '../config';
import template from '../template';
import library from '../library';
import C from '../constants';
// https://npmjs.org/package/uglify-js
import * as uglify from 'uglify-js';

function data(req, res)  {
   const slug = template.page.POST_MENU_DATA;
   // minify menu JSON for live site
   const postProcess = config.isProduction
      ? text => uglify.minify(text, { fromString: true }).code
      : null;
   res.setHeader('Vary', 'Accept-Encoding');
   res.sendView(slug, C.mimeType.JSONP, render => {
      render(slug, { library, layout: template.layout.NONE }, postProcess);
   });
}

function mobile(req, res) {
   const slug = template.page.MOBILE_MENU_DATA;
   res.sendView(slug, render => {
      render(slug, { library, layout: template.layout.NONE });
   });
}

export default {
   data,
   mobile
};