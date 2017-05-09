import { Cache, Provider } from '../types/';
import is from '../is';
import config from '../config';
import library from '../library';
import geoJSON from '../map/geojson';
import cache from '../cache';
import realGoogle from '../providers/google';

const BLOG_JSON_KEY = 'blog-map';

let google = realGoogle;

/**
 * GPX track for post.
 *
 * http://geojsonlint.com/
 */
export const track = (postKey:string) => config.cache.maps
   ? cache.map.getItem(postKey).then(item => is.cacheItem(item) ? item : loadTrack(postKey))
   : loadTrack(postKey);

/**
 * Photos for all posts.
 */
export const photos = () => config.cache.maps
   ? cache.map.getItem(BLOG_JSON_KEY).then(item => is.cacheItem(item) ? item : loadPhotos())
   : loadPhotos();

/**
 * Get photo GeoJSON (not tracks) for all posts.
 */
const loadPhotos = () => Promise.resolve(geoJSON.features())
   .then(geo => makePhotoFeatures(geo))
   .then(geo => cache.map.add(BLOG_JSON_KEY, geo));

/**
 * Get GeoJSON for single post. If post has no track then return empty GPX.
 */
function loadTrack(postKey:string):Promise<Cache.Item> {
   const post = library.postWithKey(postKey);

   if (!is.value(post)) { throw new ReferenceError(`Post ${postKey} not found in library`); }

   const noGPX = Promise.resolve(geoJSON.features());
   const getFeatures = (post.triedTrack && !post.hasTrack)
      ? noGPX
      : google.drive.loadGPX(post)
         .then(geoJSON.featuresFromGPX)
         .catch(() => noGPX);

   return getFeatures.then(geo => cache.map.add(postKey, geo));
}

/**
 * Append blog photo GeoFeatures to GeoJSON.
 */
const makePhotoFeatures = (geo?:GeoJSON.FeatureCollection<any>) =>
   new Promise<GeoJSON.FeatureCollection<any>>(resolve => {
      library.getPhotos().then(photos => {
      geo.features = geo.features.concat(photos
         .filter(p => p.latitude > 0)
         .map(p => geoJSON.pointFromPhoto(p)));

      resolve(geo);
   });
});

export default {
   track,
   photos,
   // inject different data providers
   inject: {
      set google(g:Provider.Google) { google = g; }
   }
};