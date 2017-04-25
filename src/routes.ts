import { Blog } from './types';
import * as Express from 'express';
import config from './config';
import { route as ph, httpStatus } from './constants';
import ctrl from './controllers/';
import library from './library';

/**
 * Need to capture top-level route parameters
 *
 * See http://expressjs.com/en/4x/api.html#express.router
 */
const keepParams = { mergeParams: true };

function adminRoutes() {
   const r = Express.Router();
   r.get('/', ctrl.admin.home);
   r.post('/view/delete', ctrl.admin.cache.deleteView);
   r.post('/map/delete', ctrl.admin.cache.deleteMap);
   r.post('/json/delete', ctrl.admin.cache.deleteJSON);
   r.post('/library/reload', ctrl.admin.updateLibrary);
   return r;
}

/**
 * Download and transform map layers from third-party sources
 */
function mapSourceRoutes():Express.Router {
   const r = Express.Router(keepParams);
   r.get('/mines.json', ctrl.map.source.mines);
   return r;
}

function postRoutes(photoID:string):Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', ctrl.post.latest);
   //r.get('/pdf', c.pdf);
   r.get('/map', ctrl.map.post);
   r.get('/gpx', ctrl.map.gpx);
   r.get(`/map/${photoID}`, ctrl.map.post);
   r.get('/geo.json', ctrl.map.json.post);
   return r;
}

/**
 * Series should load the PDF, GPX and GeoJSON for the main post
 */
function seriesRoutes(photoID:string):Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', ctrl.post.inSeries);
   r.get('/map', ctrl.map.series);
   r.get(`/map/${photoID}`, ctrl.map.series);
   return r;
}

function photoTagRoutes():Express.Router {
   const r = Express.Router();
   r.get('/', ctrl.photo.tags);
   r.get(`/:${ph.PHOTO_TAG}`, ctrl.photo.tags);
   r.get(`/search/:${ph.PHOTO_TAG}`, ctrl.photo.withTag);
   return r;
}

function categoryRoutes():Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', ctrl.category.list);
   r.get(`/:${ph.CATEGORY}`, ctrl.category.forPath);
   return r;
}

/**
 * Standard routes
 *
 * See http://expressjs.com/en/4x/api.html
 * See http://expressjs.com/en/guide/routing.html
 */
function standard(app:Express.Application) {
   // slug pattern
   const s = '([\\w\\d-]{4,})';
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

   app.use('/admin', adminRoutes());

   for (const slug in config.redirects) {
      app.get('/' + slug, (req:Blog.Request, res:Blog.Response) => {
         res.redirect(httpStatus.PERMANENT_REDIRECT, '/' + config.redirects[slug]);
      });
   }

   // the latest posts
   app.get('/', ctrl.category.home);
   app.get('/map', ctrl.map.blog);
   app.get('/geo.json', ctrl.map.json.blog);
   app.get('/rss', ctrl.rss);
   app.get('/about', ctrl.about);
   app.get('/js/post-menu-data.js', ctrl.menu.data);
   app.get('/sitemap.xml', ctrl.siteMap);
   app.get(`/exif/${photoID}`, ctrl.photo.exif);
   app.get('/issues?', ctrl.issues);
   app.get('/issues?/:slug'+s, ctrl.issues);
   app.get('/category-menu', ctrl.category.menu);
   app.get('/mobile-menu', ctrl.menu.mobile);
   app.get('/search', ctrl.search);

   app.use(`/${rootCategory}`, categoryRoutes());

   // old blog links with format /YYYY/MM/slug
   //app.get(`/:${ph.YEAR}(\\d{4})/:${ph.MONTH}(\\d{2})/:${ph.POST_KEY}`, c.post.date);
   app.use('/photo-tag', photoTagRoutes());
   app.use('/map/source', mapSourceRoutes());
   app.get(`/${photoID}`, ctrl.post.withPhoto);
   app.get(`/${postID}`, ctrl.post.withID);
   app.get(`/${postID}/${photoID}`, ctrl.post.withID);
   app.use(`/${postKey}`, postRoutes(photoID));
   app.use(`/${series}`, seriesRoutes(photoID));
}

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 */
function authentication(app:Express.Application) {
   // provider authentication callbacks
   app.get('/auth/flickr', ctrl.auth.flickr);
   app.get('/auth/google', ctrl.auth.google);
   // all other routes begin authentication process
   app.get('*', ctrl.auth.view);
}

export default {
   standard,
   authentication
};