'use strict';

const is = require('./is');
const log = require('./logger');
const config = require('./config');
const { distance, time } = require('./enum');
const type = {
   FEATURE: 'Feature',
   COLLECTION: 'FeatureCollection',
   POINT: 'Point',
   LINE: 'LineString',
   MULTILINE: 'MultiLineString'
};
const index = {
   LON: 0,
   LAT: 1,
   ELEVATION: 2,
   TIME: 3,
   SPEED: 4
};
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

// region From GPX

function trackFromGPX(node) {
   // total distance between points in a line
   const length = points => points.reduce((total, p, i) => total + (i > 0 ? pointDistance(points[i - 1], p) : 0), 0);
   let segments = node.getElementsByTagName('trkseg');
   let track = [];
   let stat = { topSpeed: 0, avgSpeed: 0, duration: 0, distance: 0 };
   // total points in track
   let count = 0;
   // sum of speed at all points
   let total = 0;

   for (let i = 0; i < segments.length; i++) {
      // NodeList is not ES6 iterable
      track.push(lineFromGPX(segments[i], 'trkpt'));
   }

   if (track.length == 0 || track[0].length == 0) { return null; }

   let firstPoint = track[0][0];
   let lastLine = track[track.length - 1];
   let lastPoint = lastLine[lastLine.length - 1];

   // milliseconds between first and last point converted to hours
   stat.duration = (lastPoint[index.TIME] - firstPoint[index.TIME]) / time.hour;
   //stat.duration = format.hoursAndMinutes((last[last.length - 1][point.time] - track[0][0][point.time]) / Enum.time.hour);

   // combined max and average speeds for track segments
   for (let line of track) {
      for (let point of line) {
         let speed = point[index.SPEED];

         if (speed < config.map.maxPossibleSpeed) {
            // ignore manually added track points that would imply infinite segment speeds
            if (speed > stat.topSpeed) { stat.topSpeed = parseFloat(speed.toFixed(1)); }
            count++;
            total += speed;
         }
         point = point.slice(0,3);  // remove time and speed from point
      }
      stat.distance += length(line);
      line = simplify(line);
   }

   stat.avgSpeed = parseFloat((total / count).toFixed(1));
   stat.distance = parseFloat(stat.distance.toFixed(2));

   let geoType = type.MULTILINE;
   let coords = track;

   if (track.length === 1) {
      geoType = type.LINE;
      coords = track[0];
   }

   t.properties = propertiesFromGPX(node, stat);
   t.geometry = geometry(geoType, coords);

   return t;
}

function routeFromGPX(node) {
   return {
      properties: propertiesFromGPX(node),
      geometry: geometry(type.LINE, lineFromGPX(node, 'rtept'))
   }
}

function lineFromGPX(node, name) {
   const points = node.getElementsByTagName(name);
   const line = [];

   for (let i = 0; i < points.length; i++) {
      // NodeList is not ES6 iterable
      let p = locationFromGPX(points[i]);
      if (p != null) { line.push(p); }
   }

   // calculate speed between points
   for (let i = 1; i < line.length; i++) {
      let p1 = line[i];
      let p2 = line[i - 1];
      let t = p1[index.TIME] - p2[index.TIME];   // milliseconds
      let d = distance(p1, p2);               // miles

      p1[index.SPEED] = (t > 0 && d > 0) ? d/(t/time.hour) : 0; // miles per hour
   }
   return line;
}

function pointFromGPX(node) {
   return {
      //properties: propertiesFromGPX(node, { sym: GPX.value(GPX.firstNode(node, 'sym') }),
      properties: propertiesFromGPX(node, ['sym']),
      geometry: geometry(type.POINT, locationFromGPX(node))
   };
}

// [longitude, latitude, elevation, time, speed]
// degree of latitude is approximately 69 miles
// degree of longitude is about 69 miles at the equater, 0 at the poles
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

// http://geojson.org/geojson-spec.html
// https://github.com/mapbox/togeojson
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
   let geo = { type: type.COLLECTION, features: [] };
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

// distance in miles between geographic points
// south latitudes are negative, east longitudes are positive
// http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
// http://www.geodatasource.com/developers/javascript
function pointDistance(p1, p2) {
   if (sameLocation(p1, p2)) { return 0; }
   const deg2rad = deg => deg * Math.PI / 180.0;
   const rad2deg = rad => rad * 180.0 / Math.PI;
   const theta = p1[index.LON] - p2[index.LON];
   const p1LatRad = deg2rad(p1[index.LAT]);
   const p2LatRad = deg2rad(p2[index.LAT]);
   let d = Math.sin(p1LatRad) * Math.sin(p2LatRad)
         + Math.cos(p1LatRad) * Math.cos(p2LatRad) * Math.cos(deg2rad(theta));

   if (d >= -1 && d <= 1) {
      d = Math.acos(d);
      d = rad2deg(d);
      d = d * 60 * 1.1515;    // miles
   } else {
      d = 0;
   }
   return d;
}

// shortest distance from a point to a segment
function pointLineDistance(p, p1, p2) {
   // x index in the point object
   const xi = index.LON;
   // y index in the point object
   const yi = index.LAT;
   let x = p1[xi];
   let y = p1[yi];
   let dx = p2[xi] - x;
   let dy = p2[yi] - y;

   if (dx !== 0 || dy !== 0) {
      // non-zero distance
      let t = ((p[xi] - x) * dx + (p[yi] - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
         x = p2[xi];
         y = p2[yi];
      } else if (t > 0) {
         x += dx * t;
         y += dy * t;
      }
   }

   dx = p[xi] - x;
   dy = p[yi] - y;

   return dx * dx + dy * dy;
}

// whether two points are at the same location (disregarding elevation)
const sameLocation = (p1, p2) => p1[index.LAT] == p2[index.LAT] && p1[index.LON] == p2[index.LON];

// endregion

function geometry(type, coordinates) {
   // [longitude, latitude, elevation, time, speed]
   return { type, coordinates }
}

// simplification using Douglas-Peucker algorithm with recursion elimination
function simplify(points) {
   let len = points.length;
   let keep = new Uint8Array(len);
   // convert tolerance in feet to tolerance in geographic degrees
   let tolerance = config.map.maxDeviationFeet / distance.equator;
   let first = 0;
   let last = len - 1;
   let stack = [];
   let newPoints = [];
   let maxDistance = 0;
   let d = 0;
   let index = 0;

   keep[first] = keep[last] = 1;   // keep the end-points

   while (last) {
      maxDistance = 0;

      for (let i = first + 1; i < last; i++) {
         d = pointLineDistance(points[i], points[first], points[last]);

         if (d > maxDistance) {
            index = i;
            maxDistance = d;
         }
      }

      if (maxDistance > tolerance) {
         keep[index] = 1;    // keep the deviant point
         stack.push(first, index, index, last);
      }

      last = stack.pop();
      first = stack.pop();
   }

   for (let i = 0; i < len; i++) { if (keep[i]) { newPoints.push(points[i]); }	}

   return newPoints;
}

module.exports = {
   type,
   geometry
};