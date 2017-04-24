import is from '../is';
import log from '../logger';
import gpx from './gpx';
import kml from './kml';
import index from './';
import config from '../config';
import measure from './measure';

const type = {
   FEATURE: 'Feature',
   COLLECTION: 'FeatureCollection',
   POINT: 'Point',
   LINE: 'LineString',
   MULTILINE: 'MultiLineString'
};

/**
 * @returns {GeoJSON.FeatureCollection}
 */
const features = ()=> ({ type: type.COLLECTION, features: [] });

/**
 * @param {string} type
 * @param {number[][]} coordinates
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
      .map(segment => gpx.line(segment, 'trkpt'))
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
      properties: Object.assign(gpx.properties(node), {
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
 * @returns {object}
 */
const routeFromGPX = node => ({
   properties: gpx.properties(node),
   geometry: geometry(type.LINE, gpx.line(node, 'rtept'))
});

/**
 * @param {Node|Element} node
 * @returns {GeoJSON.Feature}
 */
const pointFromGPX = node => ({
   type: type.FEATURE,
   properties: gpx.properties(node, ['sym']),
   geometry: geometry(type.POINT, gpx.location(node))
});

/**
 * @param {Node|Element} node
 * @returns {GeoJSON.Feature}
 */
const pointFromKML = node => ({
   type: type.FEATURE,
   properties: kml.properties(node, ['sym']),
   geometry: geometry(type.POINT, kml.location(node))
});

/**
 * Create GeoJSON from GPX string
 * @param {string} gpxString
 * @returns {GeoJSON.FeatureCollection}
 * @see http://geojson.org/geojson-spec.html
 * @see https://github.com/mapbox/togeojson
 */
function featuresFromGPX(gpxString) {
   const DOM = require('xmldom').DOMParser;
   const geo = features();
   let gpx = null;

   try {
      gpx = new DOM().parseFromString(gpxString);
   } catch (ex) {
      log.error(ex.toString());
      return null;
   }
   const tracks = parseNodes(gpx, 'trk', trackFromGPX);
   const routes = parseNodes(gpx, 'rte', routeFromGPX);
   const points = parseNodes(gpx, 'wpt', pointFromGPX);

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

/**
 * @param {Document} doc
 * @param {string} name Element name
 * @param {function} parser Function to parse the matched nodes
 * @returns {GeoJSON.FeatureCollection}
 */
const parseNodes = (doc, name, parser) => Array
   .from(doc.getElementsByTagName(name))
   .map(parser)
   .filter(f => is.value(f));

/**
 * Convert KML string to GeoJSON
 * @param {string} kmlString
 * @returns {GeoJSON.FeatureCollection}
 */
const featuresFromKML = kmlString => {
   const DOM = require('xmldom').DOMParser;
   const geo = features();
   let kml = null;

   kmlString = kmlString.replace(/[\r\n]/g, '').replace(/>\s+</g, '><');

   try {
      kml = new DOM().parseFromString(kmlString);
   } catch (ex) {
      log.error(ex.toString());
      return null;
   }
   //const tracks = parseNodes(kml, 'trk', trackFromGPX);
   //const routes = parseNodes(kml, 'rte', routeFromGPX);
   const tracks = [];
   const routes = [];
   const points = parseNodes(kml, 'Placemark', pointFromKML);

   geo.features = geo.features.concat(tracks, routes, points);

   return geo;
};

module.exports = {
   type,
   features,
   geometry,
   pointFromPhoto,
   featuresFromGPX,
   featuresFromKML
};