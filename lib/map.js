'use strict';

const is = require('./is');
const log = require('./logger');
const config = require('./config');
const e = require('./enum');
const units = { ENGLISH: 0, METRIC: 1 };
const type = {
   FEATURE: 'Feature',
   COLLECTION: 'FeatureCollection',
   POINT: 'Point',
   LINE: 'LineString',
   MULTILINE: 'MultiLineString'
};
const index = { LON: 0, LAT: 1, ELEVATION: 2, TIME: 3, SPEED: 4 };

function features() { return { type: type.COLLECTION, features: [] }; }

const length = points => points.reduce((total, p, i) => total + ((i > 0) ? pointDistance(points[i - 1], p) : 0), 0);

function speed(p1, p2) {
   let t = Math.abs(p1[index.TIME] - p2[index.TIME]); // milliseconds
   let d = pointDistance(p1, p2);
   return (t > 0 && d > 0) ? d/(t/e.time.hour) : 0;
}

function duration(track) {
   let firstPoint = track[0][0];
   let lastLine = track[track.length - 1];
   let lastPoint = lastLine[lastLine.length - 1];
   return (lastPoint[index.TIME] - firstPoint[index.TIME]) / (1000 * 60 * 60);
}

// region From GPX

const gpx = {
   value(node) {
      if (node && node.normalize) { node.normalize(); }
      return node && node.firstChild && node.firstChild.nodeValue;
   },
   firstValue: (node, tag) => value(this.firstNode(node, tag)),
   firstNode(node, tag) {
      var n = node.getElementsByTagName(tag);
      return n.length ? n[0] : null;
   },
   numberAttribute: (dom, name) => parseFloat(dom.getAttribute(name))
};

function trackFromGPX(node) {
   let count = 0;
   let topSpeed = 0;
   let totalSpeed = 0;
   let totalDistance = 0;
   const track = Array.from(node.getElementsByTagName('trkseg'))
      .map(s => lineFromGPX.parse(s, 'trkpt'))
      .filter(s => s[0].length > 0)
      .map(s => {
         totalDistance += length(s);
         return simplify(s.map(p => {
               const speed = p[index.SPEED];

               if (config.map.maxPossibleSpeed === 0 || speed < config.map.maxPossibleSpeed) {
                  count++;
                  totalSpeed += speed;
                  if (speed > topSpeed) { topSpeed = parseFloat(speed.toFixed(1)); }
               }
               return p.slice(0,3);  // remove time and speed from point
            }),
            config.map.maxPointDeviationFeet);
      });

   return (track.length === 0 || track[0].length === 0) ? null : {
      properties: propertiesFromGPX(node, {
         topSpeed: topSpeed,
         avgSpeed: parseFloat((totalSpeed / count).toFixed(1)),
         duration: duration(track),
         distance: parseFloat(totalDistance.toFixed(2))
      }),
      geometry: geometry({
         type: (track.length === 1) ? type.LINE : type.MULTILINE,
         coordinates: (track.length === 1) ? track[0] : track
      })
   };
}

function routeFromGPX(node) {
   return {
      properties: propertiesFromGPX(node),
      geometry: geometry(type.LINE, lineFromGPX(node, 'rtept'))
   }
}

function lineFromGPX(node, name) {
   return Array.from(node.getElementsByTagName(name))
      .map(p => locationFromGPX(p))
      .filter(p => p !== null)
      .map((p, i, line) => {
         if (i > 0) { p[location.SPEED] = speed(p, line[i - 1]); }
         return p;
      });
}

function pointFromGPX(node) {
   return {
      //properties: propertiesFromGPX(node, { sym: GPX.value(GPX.firstNode(node, 'sym') }),
      properties: propertiesFromGPX(node, ['sym']),
      geometry: geometry(type.POINT, locationFromGPX(node))
   };
}

/*
   [longitude, latitude, elevation, time, speed]
   degree of latitude is approximately 69 miles
   degree of longitude is about 69 miles at the equater, 0 at the poles
*/
function locationFromGPX(node) {
   const location = new Array(5);
   const elevation = gpx.firstNode(node, 'ele');                     // meters
   const t = gpx.firstNode(node, 'time');                            // UTC

   // decimal degrees
   location[index.LON] = gpx.numberAttribute(node, 'lon');
   location[index.LAT] = gpx.numberAttribute(node, 'lat');

   // exclude points close to home
   if (config.map.checkPrivacy && Location.distance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

   if (is.value(elevation)) {
      let m = parseFloat(gpx.value(elevation));
      // convert meters to whole feet
      location[index.ELEVATION] = Math.round(m * 3.28084);
   }

   if (is.value(t)) {
      let d = new Date(gpx.value(t));
      location[index.TIME] = d.getTime();
   }
   // speed will be calculated later
   location[index.SPEED] = 0;

   return location;
}

function propertiesFromGPX(node, extras = []) {
   let names = extras.concat(['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords']);
   let properties = {};
   //let properties = (extras === undefined) ? {} : extras;

   for (let name of names) {
      let value = gpx.firstValue(node, name);
      if (!is.empty(value)) { properties[name] = value; }
   }
   return properties;
}

/*
   http://geojson.org/geojson-spec.html
   https://github.com/mapbox/togeojson
*/
function featuresFromGPX(gpx) {
   const parseNodes = (xml, name, parser) => {
      // node list is not ES6 iterable
      let nodes = xml.getElementsByTagName(name);
      let features = [];

      for (let i = 0; i < nodes.length; i++) {
         let f = parser(nodes[i]);
         if (f !== null) { features.push(f); }
      }
      return features;
   };
   let geo = features();
   let DOM = require('xmldom').DOMParser;
   let xml = null;

   try {
      xml = new DOM().parseFromString(gpx);
   } catch (ex) {
      log.error(ex.toString());
      return null;
   }
   let tracks = parseNodes(xml, 'trk', trackFromGPX);
   let routes = parseNodes(xml, 'rte', routeFromGPX);
   let points = parseNodes(xml, 'wpt', pointFromGPX);

   geo.features = geo.features.concat(tracks, routes, points);

   return geo;
}

// endregion
// region Measurement

const piDeg = Math.PI / 180.0;
const radiusMiles = 3959;
const radiusKm = 6371;
const feetPerMeters = 3.28084;
let earthRadius = radiusMiles;
let elevationConversion = feetPerMeters;

/*
distance in miles between geographic points
south latitudes are negative, east longitudes are positive
http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
http://www.geodatasource.com/developers/javascript

   a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
   c = 2 ⋅ atan2( √a, √(1−a) )
   d = R ⋅ c
*/
function pointDistance(p1, p2) {
   if (sameLocation(p1, p2)) { return 0; }

   const φ1 = p1[index.LAT] * piDeg;
   const φ2 = p2[index.LAT] * piDeg;
   const λ1 = p1[index.LON] * piDeg;
   const λ2 = p2[index.LON] * piDeg;
   const Δφ = φ2 - φ1;
   const Δλ = λ2 - λ1;
   const a = ((1 - Math.cos(Δφ)) + (1 - Math.cos(Δλ)) * Math.cos(φ1) * Math.cos(φ2)) / 2;

   return earthRadius * 2 * Math.asin(Math.sqrt(a));
}

/*
   shortest distance from a point to a segment
*/
function pointLineDistance(p, p1, p2) {
   /* x index in the point object */
   const xi = index.LON;
   /* y index in the point object */
   const yi = index.LAT;
   let x = p1[xi];
   let y = p1[yi];
   let Δx = p2[xi] - x;
   let Δy = p2[yi] - y;

   if (Δx !== 0 || Δy !== 0) {
      /* non-zero distance */
      let t = ((p[xi] - x) * Δx + (p[yi] - y) * Δy) / (Δx * Δx + Δy * Δy);

      if (t > 1) {
         x = p2[xi];
         y = p2[yi];
      } else if (t > 0) {
         x += Δx * t;
         y += Δy * t;
      }
   }

   Δx = p[xi] - x;
   Δy = p[yi] - y;

   return Δx * Δx + Δy * Δy;
}

/*
   whether two points are at the same location (disregarding elevation)
*/
const sameLocation = (p1, p2) => p1[index.LAT] == p2[index.LAT] && p1[index.LON] == p2[index.LON];

// endregion

function geometry(type, coordinates) {
   /* [longitude, latitude, elevation, time, speed] */
   return { type, coordinates }
}

/*
   Simplification using Douglas-Peucker algorithm with recursion elimination
*/
function simplify(points) {
   if (config.map.maxPointDeviationFeet <= 0) { return points; }

   const yard = 3;
   const mile = yard * 1760;
   const equator = mile * 24901;

   let len = points.length;
   let keep = new Uint8Array(len);
   // convert tolerance in feet to tolerance in geographic degrees
   let tolerance = config.map.maxPointDeviationFeet / equator;
   let first = 0;
   let last = len - 1;
   const stack = [];
   let maxDistance = 0;
   let distance = 0;
   let index = 0;

   keep[first] = keep[last] = 1;   // keep the end-points

   while (last) {
      maxDistance = 0;

      for (let i = first + 1; i < last; i++) {
         distance = pointLineDistance(points[i], points[first], points[last]);

         if (distance > maxDistance) {
            index = i;
            maxDistance = distance;
         }
      }
      if (maxDistance > tolerance) {
         keep[index] = 1;    // keep the deviant point
         stack.push(first, index, index, last);
      }
      last = stack.pop();
      first = stack.pop();
   }
   return points.filter((p, i) => keep[i] == 1);
}

module.exports = {
   gpx,
   type,
   speed,
   length,
   geometry,
   features,
   sameLocation,
   pointDistance,
   featuresFromGPX,

   set unitType(u) {
      if (u == units.ENGLISH) {
         earthRadius = radiusMiles;
         elevationConversion = feetPerMeters;
      } else {
         earthRadius = radiusKm;
         elevationConversion = 1;
      }
   }
};