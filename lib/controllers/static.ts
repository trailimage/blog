import is from '../is';
import ld from '../json-ld';
import config from '../config';
import template from '../template';
import library from '../library';
import C from '../constants';

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

export default { search, about, siteMap, issues };
