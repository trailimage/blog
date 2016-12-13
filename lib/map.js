const is = require('./is');
const log = require('./logger');
const config = require('./config');
const C = require('./constants');
const units = { ENGLISH: 0, METRIC: 1 };
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
 * @param {String} type
 * @param coordinates
 * @returns {GeoJSON.GeometryObject}
 */
const geometry = (type, coordinates) => ({ type, coordinates });

// region From GPX

/**
 * GPX parsing methods
 */
const gpx = {
   /**
    * Node content
    * @param {Node} node
    * @returns {String}
    * @see https://developer.mozilla.org/en-US/docs/Web/API/Node.normalize
    */
   value(node) {
      if (node && node.normalize) { node.normalize(); }
      return node && node.firstChild && node.firstChild.nodeValue;
   },
   /**
    * @param {Node} node
    * @param {String} tag
    * @returns {String}
    */
   firstValue(node, tag) { return this.value(this.firstNode(node, tag)); },
   /**
    * First child or null
    * @param {Document|Node} node
    * @param {String} tag
    * @returns {Node}
    */
   firstNode(node, tag) {
      var n = node.getElementsByTagName(tag);
      return (is.value(n) && n.length > 0) ? n[0] : null;
   },
   /**
    * @param {Node|Element} dom
    * @param {String} name
    * @returns {Number}
    */
   numberAttribute: (dom, name) => parseFloat(dom.getAttribute(name))
};

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
         totalTime += duration(line);
         totalDistance += length(line);

         return simplify(line.map(point => {
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
 * @param {String} name
 * @returns {Array.<Number[]>} Array of point arrays
 */
const lineFromGPX = (node, name) =>
   Array.from(node.getElementsByTagName(name))
      .map(p => locationFromGPX(p))
      .filter(p => is.value(p))
      .map((p, i, line) => {
         if (i > 0) { p[index.SPEED] = speed(p, line[i - 1]); }
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
      pointDistance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

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
 * @param {String[]} [extras] Additional property names to retrieve
 * @returns {Object}
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
 * @param {String} gpx
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

//endregion
//region From Library Objects

/**
 * Convert photo to GeoJSON feature
 * @param {Photo} photo
 * @param {String} partKey
 * @returns {GeoJSON.Feature}
 * @see http://geojson.org/geojson-spec.html
 */
const pointFromPhoto = (photo, partKey) => ({
   type: type.FEATURE,
   id: photo.id,
   properties: {
      title: photo.title,
      partKey,
      preview: photo.size.preview.url
   },
   geometry: geometry(type.POINT, [photo.longitude, photo.latitude])
});

//endregion
//region Measurement

const piDeg = Math.PI / 180.0;
const radiusMiles = 3958.756;
const radiusKm = 6371.0;
const feetPerMeter = 3.28084;
let earthRadius = radiusMiles;
let elevationConversion = feetPerMeter;

/**
 * Total distance between all points
 * @param {Number[][]} points
 */
const length = points => points.reduce((total, p, i) => total + ((i > 0) ? pointDistance(points[i - 1], p) : 0), 0);

/**
 * Speed between two points
 * @param {Number[]} p1
 * @param {Number[]} p2
 * @returns {Number}
 */
function speed(p1, p2) {
   const t = Math.abs(p1[index.TIME] - p2[index.TIME]); // milliseconds
   const d = pointDistance(p1, p2);
   return (t > 0 && d > 0) ? d/(t/C.time.HOUR) : 0;
}

/**
 * @param {Number[][]} line
 * @returns {Number}
 */
function duration(line) {
   const firstPoint = line[0];
   const lastPoint = line[line.length - 1];
   return (lastPoint[index.TIME] - firstPoint[index.TIME]) / (1000 * 60 * 60);
}

/**
 * Distance between geographic points accounting for earth curvature
 * South latitudes are negative, east longitudes are positive
 * @param {number[]} p1 [longitude, latitude, elevation, time]
 * @param {number[]} p2
 * @returns {Number}
 * @see http://stackoverflow.com/questions/3694380/calculating-distance-between-two-points-using-latitude-longitude-what-am-i-doi
 * @see http://www.geodatasource.com/developers/javascript
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 * @see http://boulter.com/gps/distance/
 *
 * Given φ is latitude radians, λ is longitude radians, R is earth radius:
 * a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
 * c = 2 ⋅ atan2(√a, √(1−a))
 * d = R ⋅ c
 */
function pointDistance(p1, p2) {
   if (sameLocation(p1, p2)) { return 0; }

   const radLat1 = toRadians(p1[index.LAT]);
   const radLat2 = toRadians(p2[index.LAT]);
   const latDistance = toRadians(p2[index.LAT] - p1[index.LAT]);
   const lonDistance = toRadians(p2[index.LON] - p1[index.LON]);
   const a = Math.pow(Math.sin(latDistance / 2), 2)
           + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(lonDistance / 2), 2);
   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

   return earthRadius * c;
}

/**
 * Convert degrees to radians
 * @param {Number} deg
 */
const toRadians = deg => deg * piDeg;

/**
 * Shortest distance from a point to a segment
 * @param {Number[]} p
 * @param {Number[]} p1 Line endpoint
 * @param {Number[]} p2 Line endpoint
 * @returns {Number}
 */
function pointLineDistance(p, p1, p2) {
   let x = p1[index.LON];
   let y = p1[index.LAT];
   let Δx = p2[index.LON] - x;
   let Δy = p2[index.LAT] - y;

   if (Δx !== 0 || Δy !== 0) {
      // non-zero distance
      const t = ((p[index.LON] - x) * Δx + (p[index.LAT] - y) * Δy) / (Δx * Δx + Δy * Δy);

      if (t > 1) {
         x = p2[index.LON];
         y = p2[index.LAT];
      } else if (t > 0) {
         x += Δx * t;
         y += Δy * t;
      }
   }

   Δx = p[index.LON] - x;
   Δy = p[index.LAT] - y;

   return Δx * Δx + Δy * Δy;
}

/**
 * Whether two points are at the same location (disregarding elevation)
 * @param {Number[]} p1
 * @param {Number[]} p2
 * @returns {Boolean}
 */
const sameLocation = (p1, p2) => p1[index.LAT] == p2[index.LAT] && p1[index.LON] == p2[index.LON];

// endregion

/**
 * Simplification using Douglas-Peucker algorithm with recursion elimination
 * @param {Number[][]} points
 * @returns {Number[][]}
 */
function simplify(points) {
   if (config.map.maxPointDeviationFeet <= 0) { return points; }

   const yard = 3;
   const mile = yard * 1760;
   const equatorFeet = mile * radiusMiles;

   const len = points.length;
   const keep = new Uint8Array(len);
   // convert tolerance in feet to tolerance in geographic degrees
   // TODO this is a percent, not degrees
   const tolerance = config.map.maxPointDeviationFeet / equatorFeet;
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
   // export for testability
   gpx,
   type,
   speed,
   length,
   geometry,
   features,
   sameLocation,
   pointDistance,
   featuresFromGPX,
   toRadians,

   pointFromPhoto,

   set unitType(u) {
      if (u == units.ENGLISH) {
         earthRadius = radiusMiles;
         elevationConversion = feetPerMeter;
      } else {
         earthRadius = radiusKm;
         elevationConversion = 1;
      }
   }
};