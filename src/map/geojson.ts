/// <reference types="geojson" />

import { Photo, MapPhoto } from '../types/';
import { is } from '@toba/utility';
import log from '../logger';
import gpx from './gpx';
import kml from './kml';
import index from './';
import config from '../config';
import measure from './measure';
import transform from './transform';
import { DOMParser as DOM } from 'xmldom';

export const type = {
   FEATURE: 'Feature',
   COLLECTION: 'FeatureCollection',
   POINT: 'Point',
   LINE: 'LineString',
   MULTILINE: 'MultiLineString'
};

/**
 * Empty feature collection.
 */
export const features = () =>
   ({
      type: type.COLLECTION,
      features: [] as GeoJSON.Feature<any>[]
   } as GeoJSON.FeatureCollection<any>);

/**
 * Basic GeoJSON geometry may contain a single point (lat, lon array), an array
 * of points (line) or an array of lines.
 */
export const geometry = (
   type: string,
   coordinates: number[] | number[][] | number[][][]
) =>
   ({
      type,
      coordinates
   } as GeoJSON.DirectGeometryObject);

/**
 * Convert GPX to GeoJSON with calculated speed and distance values.
 */
function trackFromGPX(
   node: Element
): GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString> {
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

         return measure.simplify(
            line.map(point => {
               const speed = point[index.SPEED];

               if (
                  config.map.maxPossibleSpeed === 0 ||
                  speed < config.map.maxPossibleSpeed
               ) {
                  count++;
                  totalSpeed += speed;
                  if (speed > topSpeed) {
                     topSpeed = parseFloat(speed.toFixed(1));
                  }
               }
               return point.slice(0, 3);
            })
         );
      });

   return track.length === 0 || track[0].length === 0
      ? null
      : {
           type: 'Feature',
           properties: Object.assign(gpx.properties(node), {
              topSpeed: topSpeed,
              avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
              duration: totalTime,
              distance: parseFloat(totalDistance.toFixed(2))
           }),
           geometry:
              track.length === 1
                 ? (geometry(type.LINE, track[0]) as GeoJSON.LineString)
                 : (geometry(type.MULTILINE, track) as GeoJSON.MultiLineString)
        };
}

const routeFromGPX = (node: Element) =>
   ({
      properties: gpx.properties(node),
      geometry: geometry(type.LINE, gpx.line(node, 'rtept'))
   } as GeoJSON.Feature<GeoJSON.LineString>);

const pointFromGPX = (node: Element) =>
   ({
      type: type.FEATURE,
      properties: gpx.properties(node, ['sym']),
      geometry: geometry(type.POINT, gpx.location(node))
   } as GeoJSON.Feature<GeoJSON.Point>);

// function pointFromKML(node:Element) {
//    const location = kml.location(node);
//    return (location == null) ? null : {
//       type: type.FEATURE,
//       properties: kml.properties(node, ['sym']),
//       geometry: geometry(type.POINT, location)
//    }  as GeoJSON.Feature<GeoJSON.Point>;
// }

function lineFromKML(
   node: Element
): GeoJSON.Feature<GeoJSON.MultiLineString | GeoJSON.LineString> {
   const lines = kml.line(node);
   if (lines != null) {
      if (lines.length > 1) {
         return {
            type: type.FEATURE,
            properties: kml.properties(node),
            geometry: geometry(type.MULTILINE, lines)
         } as GeoJSON.Feature<GeoJSON.MultiLineString>;
      } else {
         return {
            type: type.FEATURE,
            properties: kml.properties(node),
            geometry: geometry(type.LINE, lines[0])
         } as GeoJSON.Feature<GeoJSON.LineString>;
      }
   }
}

/**
 * Create GeoJSON from GPX string
 *
 * http://geojson.org/geojson-spec.html
 * https://github.com/mapbox/togeojson
 */
export function featuresFromGPX(
   gpxString: string
): GeoJSON.FeatureCollection<any> {
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
 * Convert photo to GeoJSON feature.
 *
 * http://geojson.org/geojson-spec.html
 */
export const pointFromPhoto = (photo: Photo, partKey?: string) => {
   const properties: MapPhoto = { url: photo.size.preview.url };

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
 * Find nodes with a tag name and parse them into GeoJSON.
 */
function parseNodes<T extends GeoJSON.GeometryObject>(
   doc: Document,
   name: string,
   parser: (el: Element) => GeoJSON.Feature<T>
): GeoJSON.Feature<T>[] {
   return Array.from(doc.getElementsByTagName(name))
      .map(parser)
      .filter(f => is.value(f));
}

/**
 * Convert KML to GeoJSON. KML places lines and points in the same `Placemark`
 * element, only differentiated by whether they have `Point` or `LineString`
 * members. The parse method will return null if the element doesn't contain
 * the expected geometry.
 *
 * Curried method captures map `sourceName` to faciliate custom transformation
 * look-ups.
 */
export const featuresFromKML = (sourceName: string) => (
   kml: string | Document
) => {
   const geo = features();
   let doc: Document = null;

   if (is.text(kml)) {
      kml = kml.replace(/[\r\n]/g, '').replace(/>\s+</g, '><');

      try {
         doc = new DOM().parseFromString(kml);
      } catch (ex) {
         log.error(ex.toString());
         return null;
      }
   } else {
      doc = kml;
   }

   const lines = parseNodes(doc, 'Placemark', lineFromKML);
   //const points = parseNodes(doc, 'Placemark', pointFromKML);

   geo.features = postProcess(sourceName, geo.features.concat(lines));

   return geo;
};

/**
 * Apply custom transformation to properties if one is defined for the map
 * source.
 */
function postProcess(sourceName: string, features: GeoJSON.Feature<any>[]) {
   const tx = transform[sourceName];
   if (tx) {
      features.map(f => {
         f.properties = tx(f.properties);
      });
   }
   return features;
}

export default {
   type,
   features,
   geometry,
   pointFromPhoto,
   featuresFromGPX,
   featuresFromKML
};
