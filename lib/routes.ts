import { HttpStatus } from '@toba/tools';
import { blog } from '@trailimage/models';
import * as Express from 'express';
import { config } from './config';
import {
   staticPage,
   post,
   photo,
   category,
   menu,
   auth,
   map
} from './controllers/index';

/**
 * Route placeholders that become `req.params` keys.
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
 * Need to capture top-level route parameters.
 *
 * @see http://expressjs.com/en/4x/api.html#express.router
 */
const keepParams = { mergeParams: true };

function postRoutes(photoID: string): Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', post.withKey);
   //r.get('/pdf', c.pdf);
   r.get('/map', map.post);
   r.get('/gpx', map.gpx);
   r.get(`/map/${photoID}`, map.post);
   r.get('/geo.json', map.json.post);
   return r;
}

/**
 * Series should load the PDF, GPX and GeoJSON for the main post.
 */
function seriesRoutes(photoID: string): Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', post.inSeries);
   r.get('/map', map.series);
   r.get(`/map/${photoID}`, map.series);
   return r;
}

function photoTagRoutes(): Express.Router {
   const r = Express.Router();
   r.get('/', photo.tags);
   // photo tag page
   r.get(`/:${RouteParam.PhotoTag}`, photo.tags);
   // API call for photo info
   r.get(`/search/:${RouteParam.PhotoTag}`, photo.withTag);
   return r;
}

function categoryRoutes(): Express.Router {
   const r = Express.Router(keepParams);
   r.get('/', category.list);
   r.get(`/:${RouteParam.Category}`, category.forPath);
   return r;
}

/**
 * Standard routes. Regular expressions must match the full string.
 *
 * @see http://expressjs.com/en/4x/api.html
 * @see http://expressjs.com/en/guide/routing.html
 */
function standard(app: Express.Application) {
   /** Slug pattern */
   const s = '([\\w\\d-]{4,})';
   /** Flickr photo ID pattern */
   const photoID = `:${RouteParam.PhotoID}(\\d{10,11})`;
   /** Flickr set ID pattern */
   const postID = `:${RouteParam.PostID}(\\d{17})`;
   /** Post key (slug or path) pattern */
   const postKey = `:${RouteParam.PostKey}${s}`;
   const series = `:${RouteParam.SeriesKey}${s}/:${RouteParam.PartKey}${s}`;
   /** Pattern matching any root category key */
   const rootCategory = `:${RouteParam.RootCategory}(${Array.from(
      blog.categories.values()
   ).join('|')})`;

   for (const slug in config.redirects) {
      app.get('/' + slug, (_req: Express.Request, res: Express.Response) => {
         res.redirect(
            HttpStatus.PermanentRedirect,
            '/' + config.redirects[slug]
         );
      });
   }

   // the latest posts
   app.get('/', category.home);
   app.get('/map', map.blog);
   app.get(`/map/source/:${RouteParam.MapSource}([a-z\-]+\.json$)`, map.source);
   app.get('/geo.json', map.json.blog);
   app.get('/rss', staticPage.rss);
   app.get('/about', staticPage.about);
   app.get('/js/post-menu-data.js', menu.data);
   app.get('/sitemap.xml', staticPage.siteMap);
   app.get(`/exif/${photoID}`, photo.exif);
   app.get('/issues?', staticPage.issues);
   app.get('/issues?/:slug' + s, staticPage.issues);
   app.get('/category-menu', category.menu);
   app.get('/mobile-menu', menu.mobile);
   app.get('/search', staticPage.search);

   app.use(`/${rootCategory}`, categoryRoutes());

   app.use('/photo-tag', photoTagRoutes());
   app.get(`/${photoID}`, post.withPhoto);
   app.get(`/${postID}`, post.withID);
   app.get(`/${postID}/${photoID}`, post.withID);
   app.use(`/${postKey}`, postRoutes(photoID));
   app.use(`/${series}`, seriesRoutes(photoID));
}

/**
 * If a provider isn't authenticated then all paths route to authentication
 * pages.
 */
function authentication(app: Express.Application) {
   // provider authentication callbacks
   app.get('/auth/flickr', auth.flickr);
   app.get('/auth/google', auth.google);
   // all other routes begin authentication process
   app.get('*', auth.view);
}

export const route = {
   standard,
   authentication
};
