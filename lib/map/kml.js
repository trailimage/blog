const is = require('../is');
const xml = require('./xml');
const DOM = require('xmldom').DOMParser;
const index = require('./');
const unzipper = require('unzipper');

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
 * Extract properties from description HTML table.
 * @param {object.<string>} properties
 * @returns {object.<string>}
 */
function parseDescription(properties) {
   if (/^<html/.test(properties.description)) {
      let html = null;
      try {
         html = new DOM().parseFromString(properties.description);
      } catch(ex) {
         return properties;
      }

      const tables = html.getElementsByTagName('table');
      let most = 0;
      let index = -1;

      for (let i = 0; i < tables.length; i++) {
         const t = tables[i];
         if (t.childNodes.length > most) {
            most = t.childNodes.length;
            index = i;
         }
      }

      if (index > 0) {
         const rows = tables[index].getElementsByTagName('tr');
         for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            properties[xml.value(r.firstChild)] = xml.value(r.lastChild);
         }
         delete properties['description'];
      }
   }
   return properties;
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
   return parseDescription(properties);
}


module.exports = { properties, location };