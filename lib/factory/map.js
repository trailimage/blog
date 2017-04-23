const is = require('../is');
const config = require('../config');
const library = require('../library');
const geoJSON = require('../map/geojson');
const cache = require('../cache');

const BLOG_JSON_KEY = 'blog-map';
// can be replaced with injection
let google = require('../providers/google');

/**
 * Load all map information (track and photo features) for a post
 * @param {string} postKey
 * @returns {Promise.<ViewCacheItem>}
 * @see http://geojsonlint.com/
 */
const forPost = postKey => config.cache.maps
   ? cache.map.getItem(postKey).then(item => is.cacheItem(item) ? item : loadForPost(postKey))
   : loadForPost(postKey);

/**
 * Load map photos for all posts.
 * @returns {Promise.<ViewCacheItem>}
 */
const forBlog = () => config.cache.maps
   ? cache.map.getItem(BLOG_JSON_KEY).then(item => is.cacheItem(item) ? item : loadMap())
   : loadMap();

/**
 * Get photo GeoJSON (not tracks) for all posts.
 * @returns {Promise.<ViewCacheItem>}
 */
const loadMap = () => Promise.resolve(geoJSON.features())
   .then(geo => mapPhotoFeatures(geo))
   .then(geo => cache.map.add(BLOG_JSON_KEY, geo));

/**
 * Get GeoJSON for single post. If post has no track then GPX will only include
 * photo markers.
 * @param {string} postKey
 * @returns {Promise.<ViewCacheItem>}
 */
function loadForPost(postKey) {
   const post = library.postWithKey(postKey);

   if (!is.value(post)) { throw new ReferenceError(`Post ${postKey} not found in library`); }

   const noGPX = Promise.resolve(geoJSON.features());
   const getFeatures = (post.triedTrack && !post.hasTrack)
      ? noGPX
      : google.drive.loadGPX(post)
         .then(geoJSON.featuresFromGPX)
         .catch(() => noGPX);

   return getFeatures
      .then(geo => mapPostPhotoFeatures(post, geo))
      .then(geo => cache.map.add(postKey, geo));
}

/**
 * Append photo GeoFeatures to GeoJSON
 * @param {GeoJSON.FeatureCollection} [geo]
 * @returns {Promise.<object>} GeoJSON
 */
const mapPhotoFeatures = geo => new Promise(resolve => { addPhotoFeatures(geo, resolve); });

/**
 * Append photo GeoFeatures to GeoJSON
 * @param {Post} post
 * @param {GeoJSON.FeatureCollection} [geo]
 * @returns {Promise.<object>} GeoJSON
 */
const mapPostPhotoFeatures = (post, geo) => new Promise(resolve => {
   // move to the first post in a series
   if (post.isPartial) { while (!post.isSeriesStart) { post = post.previous; } }
   addPostPhotoFeatures(post, geo, resolve);
});

/**
 * @param {Post} post
 * @param {GeoJSON.FeatureCollection} geo
 * @param {function} resolve Promise resolve method
 */
function addPostPhotoFeatures(post, geo, resolve) {
   post.getPhotos().then(photos => {
      // specific slug is needed to link photo back to particular part in series
      const partKey = post.isPartial ? post.key : null;

      geo.features = geo.features.concat(photos
         .filter(p => p.latitude > 0)
         .map(p => geoJSON.pointFromPhoto(p, partKey)));

      if (post.nextIsPart) {
         addPostPhotoFeatures(post.next, geo, resolve);
      } else {
         resolve(geo);
      }
   });
}

/**
 * Add GeoJSON feature information for all photos in library.
 * @param {GeoJSON.FeatureCollection} geo
 * @param {function} resolve
 */
function addPhotoFeatures(geo, resolve) {
   library.getPhotos().then(photos => {
      geo.features = geo.features.concat(photos
         .filter(p => p.latitude > 0)
         .map(p => geoJSON.pointFromPhoto(p)));

      resolve(geo);
   });
}

module.exports = {
   forPost,
   forBlog,
   // inject different data providers
   inject: {
      set google(g) { google = g; }
   }
};