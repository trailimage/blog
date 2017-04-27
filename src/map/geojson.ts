import { Photo } from '../types/';
import is from '../is';
import log from '../logger';
import gpx from './gpx';
import kml from './kml';
import index from './';
import config from '../config';
import measure from './measure';
import { DOMParser as DOM } from 'xmldom';

const type = {
   FEATURE: 'Feature',
   COLLECTION: 'FeatureCollection',
   POINT: 'Point',
   LINE: 'LineString',
   MULTILINE: 'MultiLineString'
};

const features = ()=> ({
   type: type.COLLECTION,
   features: [] as GeoJSON.Feature<any>[]
}  as GeoJSON.FeatureCollection<any>);

const geometry = (type:string, coordinates:number[]|number[][]|number[][][]) => ({
   type,
   coordinates
}  as GeoJSON.DirectGeometryObject);

/**
 * Convert GPX to GeoJSON
 */
function trackFromGPX(node:Element):GeoJSON.Feature<GeoJSON.LineString|GeoJSON.MultiLineString> {
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
      type: 'Feature',
      properties: Object.assign(gpx.properties(node), {
         topSpeed: topSpeed,
         avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
         duration: totalTime,
         distance: parseFloat(totalDistance.toFixed(2))
      }),
      geometry: (track.length === 1)
         ? geometry(type.LINE, track[0]) as GeoJSON.LineString
         : geometry(type.MULTILINE, track) as GeoJSON.MultiLineString
   };
}

const routeFromGPX = (node:Element) => ({
   properties: gpx.properties(node),
   geometry: geometry(type.LINE, gpx.line(node, 'rtept'))
}  as GeoJSON.Feature<GeoJSON.LineString>);

const pointFromGPX = (node:Element) => ({
   type: type.FEATURE,
   properties: gpx.properties(node, ['sym']),
   geometry: geometry(type.POINT, gpx.location(node))
}  as GeoJSON.Feature<GeoJSON.Point>);

const pointFromKML = (node:Element) => ({
   type: type.FEATURE,
   properties: kml.properties(node, ['sym']),
   geometry: geometry(type.POINT, kml.location(node))
}  as GeoJSON.Feature<GeoJSON.Point>);

/**
 * Create GeoJSON from GPX string
 *
 * See http://geojson.org/geojson-spec.html
 * See https://github.com/mapbox/togeojson
 */
function featuresFromGPX(gpxString:string):GeoJSON.FeatureCollection<any> {
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
 *
 * See http://geojson.org/geojson-spec.html
 */
const pointFromPhoto = (photo:Photo, partKey?:string) => {
   const properties:{[key:string]:string} = { url: photo.size.preview.url };
   if (partKey !== undefined) {
      // implies GeoJSON for single post
      properties.title = photo.title;
      properties.partKey = partKey;
   }
   return {
      type: type.FEATURE,
      properties,
      geometry: geometry(type.POINT, [photo.longitude, photo.latitude])
   } as GeoJSON.Feature<any>;
};

/**
 * Find nodes with a tag name and parse them into GeoJSON
 */
function parseNodes<T extends GeoJSON.GeometryObject>(
   doc:Document,
   name:string,
   parser:(el:Element)=>GeoJSON.Feature<T>):GeoJSON.Feature<T>[] {

   return Array
      .from(doc.getElementsByTagName(name))
      .map(parser)
      .filter(f => is.value(f));
}

/**
 * Convert KML string to GeoJSON
 */
const featuresFromKML = (kmlString:string) => {
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
   const tracks:GeoJSON.Feature<GeoJSON.LineString>[] = [];
   const routes:GeoJSON.Feature<GeoJSON.LineString>[] = [];
   const points = parseNodes(kml, 'Placemark', pointFromKML);

   geo.features = geo.features.concat(tracks, routes, points);

   return geo;
};

export default {
   type,
   features,
   geometry,
   pointFromPhoto,
   featuresFromGPX,
   featuresFromKML
};