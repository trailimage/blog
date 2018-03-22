import { HttpStatus } from '@toba/tools';
import { Blog } from './types/';
import { photoBlog } from './models/index';
import * as Express from 'express';
import config from './config';
import cx from './controllers/';

/**
 * Route placeholders that become req.params values
 */
export enum RouteParam {
   Category = 'category',
   Month = 'month',
   PartKey = 'partKey',
   PhotoID = 'photoID',
   PhotoTag = 'tagSlug',
   PostID = 'postID',
   PostKey = 'postKey',
   RootCategory = 'rootCategory',
   SeriesKey = 'seriesKey',
   MapSource = 'mapSource',
   Year = 'year'
}

/**
 * Need to capture top-level route parameters
 *
 * http://expressjs.com/en/4x/api.html#express.router
 */
const keepParams = { mergeParams: true };

function adminRoutes() {
   const r = Express.Router();
   r.get('/', cx.admin.home);
   r.post('/view/delete', cx.admin.cache.deleteView);
   r.post('/map/delete', cx.admin.cache.deleteMap);
   r.post('/json/delete', cx.admin.cache.deleteJSON);
   r.post('/library/reload', cx.admin.updateLibrary);
   return r;
}

function postRoutes(photoID: string): Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', cx.post.withKey);
   //r.get('/pdf', c.pdf);
   r.get('/map', cx.map.post);
   r.get('/gpx', cx.map.gpx);
   r.get(`/map/${photoID}`, cx.map.post);
   r.get('/geo.json', cx.map.json.post);
   return r;
}

/**
 * Series should load the PDF, GPX and GeoJSON for the main post
 */
function seriesRoutes(photoID: string): Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', cx.post.inSeries);
   r.get('/map', cx.map.series);
   r.get(`/map/${photoID}`, cx.map.series);
   return r;
}

function photoTagRoutes(): Express.Router {
   const r = Express.Router();
   r.get('/', cx.photo.tags);
   // photo tag page
   r.get(`/:${RouteParam.PhotoTag}`, cx.photo.tags);
   // API call for photo info
   r.get(`/search/:${RouteParam.PhotoTag}`, cx.photo.withTag);
   return r;
}

function categoryRoutes(): Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', cx.category.list);
   r.get(`/:${RouteParam.Category}`, cx.category.forPath);
   return r;
}

/**
 * Standard routes. Regular expressions must match the full string.
 *
 * http://expressjs.com/en/4x/api.html
 * http://expressjs.com/en/guide/routing.html
 */
function standard(app: Express.Application) {
   // slug pattern
   const s = '([\\w\\d-]{4,})';
   // Flickr photo ID pattern
   const photoID = `:${RouteParam.PhotoID}(\\d{10,11})`;
   // Flickr set ID pattern
   const postID = `:${RouteParam.PostID}(\\d{17})`;
   // post key (slug or path) pattern
   const postKey = `:${RouteParam.PostKey}${s}`;
   const series = `:${RouteParam.SeriesKey}${s}/:${RouteParam.PartKey}${s}`;
   // pattern matching any root category key
   const rootCategory =
      ':' +
      RouteParam.RootCategory +
      '(' +
      Object.keys(photoBlog.categories)
         .map(name => photoBlog.categories[name].key)
         .join('|') +
      ')';

   app.use('/admin', adminRoutes());

   for (const slug in config.redirects) {
      app.get('/' + slug, (_req: Blog.Request, res: Blog.Response) => {
         res.redirect(
            HttpStatus.PermanentRedirect,
            '/' + config.redirects[slug]
         );
      });
   }

   // the latest posts
   app.get('/', cx.category.home);
   app.get('/map', cx.map.blog);
   app.get(
      `/map/source/:${RouteParam.MapSource}([a-z\-]+\.json$)`,
      cx.map.source
   );
   app.get('/geo.json', cx.map.json.blog);
   app.get('/rss', cx.rss);
   app.get('/about', cx.about);
   app.get('/js/post-menu-data.js', cx.menu.data);
   app.get('/sitemap.xml', cx.siteMap);
   app.get(`/exif/${photoID}`, cx.photo.exif);
   app.get('/issues?', cx.issues);
   app.get('/issues?/:slug' + s, cx.issues);
   app.get('/category-menu', cx.category.menu);
   app.get('/mobile-menu', cx.menu.mobile);
   app.get('/search', cx.search);

   app.use(`/${rootCategory}`, categoryRoutes());

   // old blog links with format /YYYY/MM/slug
   //app.get(`/:${ph.YEAR}(\\d{4})/:${ph.MONTH}(\\d{2})/:${ph.POST_KEY}`, c.post.date);
   app.use('/photo-tag', photoTagRoutes());
   app.get(`/${photoID}`, cx.post.withPhoto);
   app.get(`/${postID}`, cx.post.withID);
   app.get(`/${postID}/${photoID}`, cx.post.withID);
   app.use(`/${postKey}`, postRoutes(photoID));
   app.use(`/${series}`, seriesRoutes(photoID));
}

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 */
function authentication(app: Express.Application) {
   // provider authentication callbacks
   app.get('/auth/flickr', cx.auth.flickr);
   app.get('/auth/google', cx.auth.google);
   // all other routes begin authentication process
   app.get('*', cx.auth.view);
}

export default {
   standard,
   authentication
};
