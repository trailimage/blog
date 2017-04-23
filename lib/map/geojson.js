const is = require('../is');
const log = require('../logger');
const gpx = require('./gpx');
const config = require('../config');
const measure = require('./measure');

const type = {
   FEATURE: 'Feature',
   COLLECTION: 'FeatureCollection',
   POINT: 'Point',
   LINE: 'LineString',
   MULTILINE: 'MultiLineString'
};

/**
 * Elements of a coordinate in the order expected by Google Maps
 * @type {{LON: number, LAT: number, ELEVATION: number, TIME: number, SPEED: number}}
 */
const index = { LON: 0, LAT: 1, ELEVATION: 2, TIME: 3, SPEED: 4 };

/**
 * @returns {GeoJSON.FeatureCollection}
 */
const features = ()=> ({ type: type.COLLECTION, features: [] });

/**
 * @param {string} type
 * @param coordinates
 * @returns {GeoJSON.GeometryObject}
 */
const geometry = (type, coordinates) => ({ type, coordinates });

/**
 * Convert GPX to GeoJSON
 * @param {Element} node
 * @returns {GeoJSON.Feature}
 */
function trackFromGPX(node) {
   let count = 0;
   let topSpeed = 0;
   let totalTime = 0;
   let totalSpeed = 0;
   let totalDistance = 0;
   const track = Array.from(node.getElementsByTagName('trkseg'))
      .map(segment => lineFromGPX(segment, 'trkpt'))
      .filter(line => line[0].length > 0)
      .map(line => {
         totalTime += measure.duration(line);
         totalDistance += measure.length(line);

         return measure.simplify(line.map(point => {
            const speed = point[index.SPEED];

            if (config.map.maxPossibleSpeed === 0 || speed < config.map.maxPossibleSpeed) {
               count++;
               totalSpeed += speed;
               if (speed > topSpeed) { topSpeed = parseFloat(speed.toFixed(1)); }
            }
            return point.slice(0, 3);
         }));
      });

   return (track.length === 0 || track[0].length === 0) ? null : {
      type: type.FEATURE,
      properties: Object.assign(propertiesFromGPX(node), {
         topSpeed: topSpeed,
         avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
         duration: totalTime,
         distance: parseFloat(totalDistance.toFixed(2))
      }),
      geometry: (track.length === 1)
         ? geometry(type.LINE, track[0])
         : geometry(type.MULTILINE, track)
   };
}

/**
 * @param {Node|Element} node
 * @returens {Object}
 */
const routeFromGPX = node => ({
   properties: propertiesFromGPX(node),
   geometry: geometry(type.LINE, lineFromGPX(node, 'rtept'))
});

/**
 * @param {Node|Element} node
 * @param {string} name
 * @returns {Array.<Number[]>} Array of point arrays
 */
const lineFromGPX = (node, name) =>
   Array.from(node.getElementsByTagName(name))
      .map(p => locationFromGPX(p))
      .filter(p => is.value(p))
      .map((p, i, line) => {
         if (i > 0) { p[index.SPEED] = measure.speed(p, line[i - 1]); }
         return p;
      });

/**
 * @param {Node|Element} node
 * @returns {GeoJSON.Feature}
 */
const pointFromGPX = node => ({
   type: type.FEATURE,
   properties: propertiesFromGPX(node, ['sym']),
   geometry: geometry(type.POINT, locationFromGPX(node))
});

/**
 * Return location as [latitude, longitude, elevation, time, speed]
 * A degree of latitude is approximately 69 miles
 * A degree of longitude is about 69 miles at the equater, 0 at the poles
 * @param {Node|Element} node
 * @returns {Number[]}
 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
 */
function locationFromGPX(node) {
   const location = new Array(5);
   const elevation = gpx.firstNode(node, 'ele');                     // meters
   const t = gpx.firstNode(node, 'time');                            // UTC

   // WGS84 decimal degrees
   location[index.LON] = gpx.numberAttribute(node, 'lon');
   location[index.LAT] = gpx.numberAttribute(node, 'lat');

   // exclude points close to home
   if (config.map.checkPrivacy &&
      measure.pointDistance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

   if (is.value(elevation)) {
      const m = parseFloat(gpx.value(elevation));
      // convert meters to whole feet
      location[index.ELEVATION] = Math.round(m * 3.28084);
   }

   if (is.value(t)) {
      const d = new Date(gpx.value(t));
      location[index.TIME] = d.getTime();
   }
   // speed will be calculated later
   location[index.SPEED] = 0;

   return location;
}

/**
 * Properties of a GPX node
 * @param {Node} node
 * @param {string[]} [extras] Additional property names to retrieve
 * @returns {object}
 */
function propertiesFromGPX(node, extras = []) {
   const names = extras.concat(['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords']);
   const properties = {};

   for (const key of names) {
      const value = gpx.firstValue(node, key);
      if (!is.empty(value)) { properties[key] = value; }
   }
   return properties;
}

/**
 * Create GeoJSON from GPX string
 * @param {string} gpx
 * @returns {GeoJSON.FeatureCollection}
 * @see http://geojson.org/geojson-spec.html
 * @see https://github.com/mapbox/togeojson
 */
function featuresFromGPX(gpx) {
   const parseNodes = (xml, name, parser) => Array
      .from(xml.getElementsByTagName(name))
      .map(parser)
      .filter(f => is.value(f));
   const DOM = require('xmldom').DOMParser;
   const geo = features();
   let xml = null;

   try {
      xml = new DOM().parseFromString(gpx);
   } catch (ex) {
      log.error(ex.toString());
      return null;
   }
   const tracks = parseNodes(xml, 'trk', trackFromGPX);
   const routes = parseNodes(xml, 'rte', routeFromGPX);
   const points = parseNodes(xml, 'wpt', pointFromGPX);

   geo.features = geo.features.concat(tracks, routes, points);

   return geo;
}

/**
 * Convert photo to GeoJSON feature
 * @param {Photo} photo
 * @param {string} [partKey]
 * @returns {GeoJSON.Feature}
 * @see http://geojson.org/geojson-spec.html
 */
const pointFromPhoto = (photo, partKey) => {
   const properties = { url: photo.size.preview.url };
   if (partKey !== undefined) {
      // implies GeoJSON for single post
      properties.title = photo.title;
      properties.partKey = partKey;
   }
   return {
      type: type.FEATURE,
      properties,
      geometry: geometry(type.POINT, [photo.longitude, photo.latitude])
   };
};

module.exports = {
   type,
   features,
   geometry,
   pointFromPhoto,
   featuresFromGPX
};