import { is } from '@toba/tools';
import { photoBlog } from '../models/index';
import config from '../config';
import { geoJSON } from '@toba/map';

const BLOG_JSON_KEY = 'blog-map';

/**
 * GPX track for post.
 *
 * http://geojsonlint.com/
 */
export const track = (postKey: string) =>
   config.cache.maps
      ? cache.map
           .getItem(postKey)
           .then(item => (is.cacheItem(item) ? item : loadTrack(postKey)))
      : loadTrack(postKey);

/**
 * Photos for all posts.
 */
export const photos = () =>
   config.cache.maps
      ? cache.map
           .getItem(BLOG_JSON_KEY)
           .then(item => (is.cacheItem(item) ? item : loadPhotos()))
      : loadPhotos();

/**
 * Get photo GeoJSON (not tracks) for all posts.
 */
const loadPhotos = () =>
   Promise.resolve(geoJSON.features())
      .then(geo => makePhotoFeatures(geo))
      .then(geo => cache.map.add(BLOG_JSON_KEY, geo));

/**
 * Get GeoJSON for single post. If post has no track then return empty GPX.
 */
function loadTrack(postKey: string): Promise<Cache.Item> {
   const post = photoBlog.postWithKey(postKey);

   if (!is.value(post)) {
      throw new ReferenceError(`Post ${postKey} not found in library`);
   }

   const noGPX = Promise.resolve(geoJSON.features());
   const getFeatures =
      post.triedTrack && !post.hasTrack
         ? noGPX
         : google.drive
              .loadGPX(post)
              .then(geoJSON.featuresFromGPX)
              .catch(() => noGPX);

   return getFeatures.then(geo => cache.map.add(postKey, geo));
}

/**x
 * Append blog photo GeoFeatures to GeoJSON.
 */
async function makePhotoFeatures(geo: GeoJSON.FeatureCollection<any>) {
   const photos = await photoBlog.getPhotos();
   geo.features = geo.features.concat(
      photos.filter(p => p.latitude > 0).map(p => p.geoJSON())
   );
   return geo;
}
