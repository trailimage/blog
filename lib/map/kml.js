const is = require('../is');
const xml = require('./xml');
const index = require('./');

/**
 * Return location as [latitude, longitude, elevation]
 * @param {Node|Element} node
 * @returns {number[]}
 */
function location(node) {
   const location = new Array(3);
   const point = xml.firstNode(node, 'Point');

   if (point != null) {
      const coordinates = xml.firstValue(point, 'coordinates');
      if (coordinates != null) {
         const parts = coordinates.split(',').map(parseFloat);
         location[index.LON] = parts[0];
         location[index.LAT] = parts[1];
         location[index.ELEVATION] = parts[2];
      }
   }
   return location;
}

/**
 * Properties of a KML node
 * @param {Node} node
 * @param {string[]} [extras] Additional property names to retrieve
 * @returns {object}
 */
function properties(node, extras = []) {
   const names = extras.concat(['name', 'description']); // styleUrl,
   const properties = {};

   for (const key of names) {
      const value = xml.firstValue(node, key);
      if (!is.empty(value)) { properties[key] = value; }
   }
   return properties;
}


module.exports = { properties, location };