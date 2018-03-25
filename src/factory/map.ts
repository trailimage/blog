import { is, titleCase } from '@toba/tools';
import { photoBlog } from '../models/';
import config from '../config';
import { geoJSON, MapProperties } from '@toba/map';

const BLOG_JSON_KEY = 'blog-map';

/**
 * GPX track for post.
 *
 * http://geojsonlint.com/
 */
const track = (postKey: string) =>
   config.cache.maps
      ? cache.map
           .getItem(postKey)
           .then(item => (is.cacheItem(item) ? item : loadTrack(postKey)))
      : loadTrack(postKey);

/**
 * Photos for all posts.
 */
const photos = () =>
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

/**
 * Copy labeled values to new labels.
 */
function relabel(
   from: MapProperties,
   out: MapProperties,
   labels: { [key: string]: string }
): void {
   Object.keys(labels).forEach(key => {
      if (from[key]) {
         out[labels[key]] = from[key];
      }
   });
}

const vehicle: { [key: string]: string } = {
   ATV: 'ATV',
   AUTOMOBILE: 'Automobile',
   JEEP: 'Jeep',
   MOTORCYCLE: 'Motorcycle',
   UTV: 'UTV'
};

/**
 * Update seasonal restriction field.
 */
export function seasonal(
   vehicleKey: string,
   from: MapProperties,
   out: MapProperties
): void {
   if (from[vehicleKey]) {
      out[vehicle[vehicleKey] + ' Allowed'] = from[vehicleKey];
   }
}

/**
 * Custom property transformations per named map source.
 */
function trails(from: MapProperties): MapProperties {
   const out: MapProperties = {};
   const miles: number = from['MILES'] as number;
   const who = 'Jurisdiction';
   let name: string = from['NAME'] as string;
   let label: string = from['name'] as string;

   if (miles && miles > 0) {
      out['Miles'] = miles;
   }
   if (is.value(label)) {
      label = label.toString().trim();
   }

   if (!is.empty(name) && !is.empty(label)) {
      name = titleCase(name.toString().trim());
      // label is usually just a number so prefer name when supplied
      const num = label.replace(/\D/g, '');
      // some names alread include the road or trail number and
      // some have long numbers that aren't helpful
      label =
         (num.length > 1 && name.includes(num)) || num.length > 3
            ? name
            : name + ' ' + label;
   }

   if (label) {
      out['Label'] = label;
   }

   Object.keys(vehicle).forEach(key => {
      seasonal(key, from, out);
   });

   relabel(from, out, { JURISDICTION: who });

   if (out[who]) {
      out[who] = titleCase(out[who] as string);
   }

   return out;
}

function mines(from: MapProperties): MapProperties {
   const out: MapProperties = {};
   // lowercase "name" is the county name
   relabel(from, out, {
      FSAgencyName: 'Forest Service Agency',
      LandOwner: 'Land Owner',
      DEPOSIT: 'Name',
      Mining_District: 'Mining District'
   });
   return out;
}

export const map = {
   track,
   photos
};
