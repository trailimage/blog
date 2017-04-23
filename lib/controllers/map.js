const is = require('../is');
const log = require('../logger');
const fetch = require('node-fetch');
const config = require('../config');
const template = require('../template');
const library = require('../library');
const factory = require('../factory/');
const C = require('../constants');
/** Route placeholders */
const ph = C.route;
// can be replaced with injection
let google = require('../providers/google');

/**
 * Map screen loads then makes AJAX call to fetch data
 * @param {Post} post
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function view(post, req, res) {
   if (is.value(post)) {
      const key = post.isPartial ? post.seriesKey : post.key;
      const photoID = req.params[ph.PHOTO_ID];

      res.render(template.page.MAP, {
         layout: template.layout.NONE,
         title: 'Map',
         post,
         key,
         photoID: is.numeric(photoID) ? photoID : 0,
         config
      });
   } else {
      res.notFound();
   }
}

function post(req, res) {
   view(library.postWithKey(req.params[ph.POST_KEY]), req, res);
}

function series(req, res) {
   view(library.postWithKey(req.params[ph.SERIES_KEY], req.params[ph.PART_KEY]), req, res);
}

/**
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 * @see https://www.mapbox.com/mapbox-gl-js/example/cluster/
 */
function blog(req, res) {
   res.render(template.page.MAPBOX, {
      layout: template.layout.NONE,
      title: config.site.title + ' Map',
      config
   });
}

/**
 * Compressed GeoJSON of all post photos
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function blogJSON(req, res) {
   factory.map.forBlog()
      .then(item => { res.sendCompressed(C.mimeType.JSON, item); })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

/**
 * Compressed GeoJSON of photos and tracks for single post as zipped byte array
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function postJSON(req, res) {
   factory.map.forPost(req.params[ph.POST_KEY])
      .then(item => { res.sendCompressed(C.mimeType.JSON, item); })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

/**
 * Retrieve and parse mines map source
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function mapSourceMines(req, res) {
   const opt = { headers: { 'User-Agent': 'node.js' }};
   fetch(config.map.source.mines, opt).then(kml => {
      res.write(kml);
   });
}

/**
 * @param {BlogRequest} req
 * @param {BlogResponse} res
 */
function gpx(req, res) {
   const post = config.map.allowDownload ? library.postWithKey(req.params[ph.POST_KEY]) : null;

   if (is.value(post)) {
      google.drive.loadGPX(post, res)
         .then(()=> { res.end(); })
         // errors already logged by loadGPX()
         .catch(res.notFound);
   } else {
      res.notFound();
   }
}

module.exports = {
   gpx,
   post,
   series,
   blog,
   json: {
      blog: blogJSON,
      post: postJSON
   },
   source: {
      mines: mapSourceMines
   },
   // inject different data providers
   inject: {
      set google(g) { google = g; }
   }
};