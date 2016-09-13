'use strict';

const Express = require('express');
const config = require('./config');
const C = require('./constants');
const r = Express.Router();
const c = require('./controller');
const library = require('./library');

r.get('/', c.admin.home);
r.post('/view/delete', c.cache.deletePost);
r.post('/map/delete', c.cache.deleteMap);
r.post('/model/reload', c.reloadModel);

/**
 * @param app Express instance
 * @see http://expressjs.com/4x/api.html#router
 * @see http://expressjs.com/guide/routing.html
 */
function standard(app) {
   // slug pattern
   const s = '([\\w\\d-]{4,})';
   // route placeholders
   const ph = C.route;
   // Flickr photo ID pattern
   const photoID = `:${ph.PHOTO_ID}(\\d{10,11})`;
   // Flickr set ID pattern
   const postID = `:${ph.POST_ID}(\\d{17})`;
   // post key (slug or path) pattern
   const postKey = `:${ph.POST_KEY}${s}`;
   const series = `:${ph.SERIES_KEY}${s}/:${ph.PART_KEY}${s}`;
   // pattern matching any root category key
   const rootCategory = ':' + ph.ROOT_CATEGORY + '(' + Object
         .keys(library.categories)
         .map(name => library.categories[name].key)
         .join('|') + ')';

   app.use('/admin', r.admin);
   //app.use('/api/v1', r.api);
   //app.use('/auth', r.auth);

   for (let slug in config.redirects) {
      app.get('/' + slug, (req, res) => {
         res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + config.redirects[slug]);
      });
   }

   // the latest posts
   app.get('/', c.post.home);
   app.get('/rss', c.rss.view);
   app.get('/about', c.about);
   app.get('/js/post-menu-data.js', c.menu.data);
   app.get('/sitemap.xml', c.siteMap);
   app.get(`/exif/${photoID}`, c.photo.exif);
   app.get('/issues?', c.issues);
   app.get('/issues?/:slug'+s, c.issues);
   app.get('/category-menu', c.menu.category);
   app.get('/mobile-menu', c.menu.mobile);
   app.get('/search', c.search);
   app.get(`/${rootCategory}`, c.category.list);
   app.get(`/${rootCategory}/:${ph.CATEGORY}`, c.category.view);
   // old blog links with format /YYYY/MM/slug
   app.get(`/:${ph.YEAR}(\\d{4})/:${ph.MONTH}(\\d{2})/:${ph.POST_KEY}`, c.post.date);
   app.get('/photo-tag', c.photo.tags);
   app.get(`/photo-tag/:${ph.PHOTO_TAG}`, c.photo.tags);
   app.get(`/photo-tag/search/:${ph.PHOTO_TAG}`, c.photo.withTag);
   // links with bare photo provider ID
   app.get(`/${photoID}`, c.photo.view);
   // links with bare photo provider set ID
   app.get(`/${postID}`, c.post.providerID);
   app.get(`/${postID}/${photoID}`, c.post.providerID);

   app.get(`/${postKey}/pdf`, c.pdf);
   app.get(`/${postKey}/map`, c.map.view);
   app.get(`/${postKey}/gpx`, c.map.download);
   app.get(`/${postKey}/map/${photoID}`, c.map.view);
   app.get(`/${postKey}/geo.json`, c.map.json);

   app.get(`/${series}`, c.post.inSeries);
   app.get(`/${series}/map`, c.map.forSeries);
   app.get(`/${series}/map/${photoID}`, c.map.forSeries);
   app.get(`/${postKey}`, c.post.view);
}

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 * @param app Express instance
 */
function authentication(app) {
   // provider authentication callbacks
   app.get('/auth/flickr', c.auth.flickr);
   app.get('/auth/google', c.auth.google);
   // all other routes begin authentication process
   app.get('*', c.auth.view);
}

module.exports = {
   standard,
   authentication
};