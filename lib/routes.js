const Express = require('express');
const config = require('./config');
const C = require('./constants');
const c = require('./controllers/');
const library = require('./library');
/** Route placeholders */
const ph = C.route;

/**
 * Need to capture top-level route parameters
 * @see http://expressjs.com/en/4x/api.html#express.router
 */
const keepParams = { mergeParams: true };

function adminRoutes() {
   const r = Express.Router();
   r.get('/', c.admin.home);
   r.post('/view/delete', c.admin.cache.deleteView);
   r.post('/map/delete', c.admin.cache.deleteMap);
   r.post('/json/delete', c.admin.cache.deleteJSON);
   r.post('/library/reload', c.admin.updateLibrary);
   return r;
}

/**
 * Download map layers from third-party sources
 * @returns {core.Router}
 */
function mapSourceRoutes() {
   const r = Express.Router(keepParams);
   r.get('/mines.json', c.map.source.mines);
   return r;
}

/**
 * @param {string} photoID Pattern
 * @returns {core.Router}
 */
function postRoutes(photoID) {
   const r = Express.Router(keepParams);
   r.get('/', c.post.latest);
   //r.get('/pdf', c.pdf);
   r.get('/map', c.map.post);
   r.get('/gpx', c.map.gpx);
   r.get(`/map/${photoID}`, c.map.post);
   r.get('/geo.json', c.map.json.post);
   return r;
}

/**
 * Series should load the PDF, GPX and GeoJSON for the main post
 * @param {string} photoID Pattern
 * @returns {core.Router}
 */
function seriesRoutes(photoID) {
   const r = Express.Router(keepParams);
   r.get('/', c.post.inSeries);
   r.get('/map', c.map.series);
   r.get(`/map/${photoID}`, c.map.series);
   return r;
}

function photoTagRoutes() {
   const r = Express.Router();
   r.get('/', c.photo.tags);
   r.get(`/:${ph.PHOTO_TAG}`, c.photo.tags);
   r.get(`/search/:${ph.PHOTO_TAG}`, c.photo.withTag);
   return r;
}

function categoryRoutes() {
   const r = Express.Router(keepParams);
   r.get('/', c.category.list);
   r.get(`/:${ph.CATEGORY}`, c.category.forPath);
   return r;
}

/**
 * @param app Express instance
 * @see http://expressjs.com/en/4x/api.html
 * @see http://expressjs.com/en/guide/routing.html
 */
function standard(app) {
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
      app.get('/' + slug, (req, res) => {
         res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + config.redirects[slug]);
      });
   }

   // the latest posts
   app.get('/', c.category.home);
   app.get('/map', c.map.blog);
   app.get('/geo.json', c.map.json.blog);
   app.get('/rss', c.rss);
   app.get('/about', c.about);
   app.get('/js/post-menu-data.js', c.menu.data);
   app.get('/sitemap.xml', c.siteMap);
   app.get(`/exif/${photoID}`, c.photo.exif);
   app.get('/issues?', c.issues);
   app.get('/issues?/:slug'+s, c.issues);
   app.get('/category-menu', c.category.menu);
   app.get('/mobile-menu', c.menu.mobile);
   app.get('/search', c.search);

   app.use(`/${rootCategory}`, categoryRoutes());

   // old blog links with format /YYYY/MM/slug
   //app.get(`/:${ph.YEAR}(\\d{4})/:${ph.MONTH}(\\d{2})/:${ph.POST_KEY}`, c.post.date);
   app.use('/photo-tag', photoTagRoutes());
   app.use('/map/source', mapSourceRoutes());
   app.get(`/${photoID}`, c.post.withPhoto);
   app.get(`/${postID}`, c.post.withID);
   app.get(`/${postID}/${photoID}`, c.post.withID);
   app.use(`/${postKey}`, postRoutes(photoID));
   app.use(`/${series}`, seriesRoutes(photoID));
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