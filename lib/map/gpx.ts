const config = require('../config');
const is = require('../is');
const xml = require('./xml');
const measure = require('./measure');
const index = require('./');

/**
 * Return location as [latitude, longitude, elevation, time, speed]
 * A degree of latitude is approximately 69 miles
 * A degree of longitude is about 69 miles at the equater, 0 at the poles
 * @param {Node|Element} node
 * @returns {number[]}
 * @see http://nationalatlas.gov/articles/mapping/a_latlong.html
 */
function location(node) {
   const location = new Array(5);
   const elevation = xml.firstNode(node, 'ele');                     // meters
   const t = xml.firstNode(node, 'time');                            // UTC

   // WGS84 decimal degrees
   location[index.LON] = xml.numberAttribute(node, 'lon');
   location[index.LAT] = xml.numberAttribute(node, 'lat');

   // exclude points close to home
   if (config.map.checkPrivacy &&
      measure.pointDistance(location, config.map.privacyCenter) < config.map.privacyMiles) { return null; }

   if (is.value(elevation)) {
      const m = parseFloat(xml.value(elevation));
      // convert meters to whole feet
      location[index.ELEVATION] = Math.round(m * 3.28084);
   }

   if (is.value(t)) {
      const d = new Date(xml.value(t));
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
function properties(node, extras = []) {
   const names = extras.concat(['name', 'desc', 'author', 'copyright', 'link', 'time', 'keywords']);
   const properties = {};

   for (const key of names) {
      const value = xml.firstValue(node, key);
      if (!is.empty(value)) { properties[key] = value; }
   }
   return properties;
}

/**
 * @param {Node|Element} node
 * @param {string} name
 * @returns {number[][]} Array of point arrays
 */
const line = (node, name) =>
   Array.from(node.getElementsByTagName(name))
      .map(p => location(p))
      .filter(p => is.value(p))
      .map((p, i, line) => {
         if (i > 0) { p[index.SPEED] = measure.speed(p, line[i - 1]); }
         return p;
      });

module.exports = { location, line, properties };