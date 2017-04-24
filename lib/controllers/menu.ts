const config = require('../config');
const template = require('../template');
const library = require('../library');
const C = require('../constants');
// https://npmjs.org/package/uglify-js
const uglify = require('uglify-js');

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

module.exports = {
   data,
   mobile
};