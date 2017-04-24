import is from '../is';
const is = require('../is');
const ld = require('../json-ld');
const config = require('../config');
const template = require('../template');
const library = require('../library');
const C = require('../constants');

function search(req, res) {
   const term = req.query['q'];

   if (is.value(term)) {
      res.render(template.page.SEARCH, {
         title: 'Search for “' + req.query['q'] + '”',
         config: config
      });
   } else {
      res.notFound();
   }
}

function about(req, res) {
   res.sendView(template.page.ABOUT, {
      title: 'About ' + config.site.title,
      jsonLD: ld.serialize(ld.owner)
   });
}

function siteMap(req, res) {
   res.sendView(template.page.SITEMAP, C.mimeType.XML, render => {
      render(template.page.SITEMAP, {
         posts: library.posts,
         categories: library.categoryKeys(),
         tags: library.tags,
         layout: null
      });
   });
}

function issues(req, res) {
   res.redirect(C.httpStatus.PERMANENT_REDIRECT, 'http://issues.' + config.domain);
}

module.exports = { search, about, siteMap, issues };
