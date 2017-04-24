const geoJSON = require('../../lib/map/geojson');
const mocha = require('mocha');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const stream = require('stream');
const { expect } = require('chai');
const google = require('../mocks/google.mock');
const nl = require('os').EOL;

/**
 * @param {number[]} point
 * @returns {number[]}
 */
function expectGeoPoint(point) {
   expect(point).is.instanceOf(Array);
   expect(point[0]).within(-180, 180);
   expect(point[1]).within(-90, 90);
   return point;
}

/**
 * Use technique that supports large files
 * @param {string} name
 * @returns {Promise.<string>} File content
 */
function loadMockFile(name) {
   return new Promise(resolve => {
      const input = fs.createReadStream(path.normalize(__dirname + '/../mocks/' + name));
      const output = new stream();
      const rl = readline.createInterface(input, output);
      let file = '';
      rl.on('line', line => file += line + nl);
      rl.on('close', ()=> resolve(file));
   });
}

describe('GeoJSON', ()=> {
   it('converts GPX files to GeoJSON', ()=> {
      const post = { key: 'whatever' };
      return google.drive.loadGPX(post).then(geoJSON.featuresFromGPX).then(geo => {
         expect(geo).to.exist;
         expect(geo).has.property('type', geoJSON.type.COLLECTION);
         expect(geo).has.property('features');
         expect(geo.features).is.instanceOf(Array);
         expect(geo.features).is.lengthOf(4);

         const first = geo.features[0];
         expect(first).to.contain.all.keys(['geometry', 'properties']);
         expect(first.geometry).has.property('type', geoJSON.type.LINE);
         expect(first.geometry).has.property('coordinates');
         expect(first.geometry.coordinates).is.instanceOf(Array);
         expect(first.geometry.coordinates).is.length.above(200);
         expect(first.properties).has.property('time', '2014-05-18T19:56:51Z');

         first.geometry.coordinates.forEach(expectGeoPoint);
      });
   });

   it('converts KML files to GeoJSON', ()=> loadMockFile('mines.kml').then(kml => {
      const geo = geoJSON.featuresFromKML(kml);
      expect(geo).to.exist;
   }));
});
