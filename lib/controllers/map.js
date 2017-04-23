const is = require('../is');
const log = require('../logger');
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
 */
function postJSON(req, res) {
   factory.map.forPost(req.params[ph.POST_KEY])
      .then(item => { res.sendCompressed(C.mimeType.JSON, item); })
      .catch(err => {
         log.error(err);
         res.notFound();
      });
}

function mapSourceMines(req, res) {
   res.notFound();
}

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