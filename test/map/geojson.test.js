const geoJSON = require('../../lib/map/geojson').default;
const mocha = require('mocha');
const kml = require('../../lib/map/kml').default;
const { expect } = require('chai');
const mock = require('../mocks/');
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

describe('GeoJSON', ()=> {
   it('converts GPX files to GeoJSON', ()=> {
      const post = { key: 'whatever' };
      return mock.google.drive.loadGPX(post).then(geoJSON.featuresFromGPX).then(geo => {
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

   it.skip('converts KML files to GeoJSON', ()=> Promise.all([
      // mock.loadFile('mines.kmz')
      //    .then(kml.fromKMZ)
      //    .then(geoJSON.featuresFromKML('Idaho Geological Survey'))
      //    .then(geo => {
      //       expect(geo).to.exist;
      //       expect(geo).has.property('type', geoJSON.type.COLLECTION);
      //       expect(geo).has.property('features');
      //       expect(geo.features).is.instanceOf(Array);
      //       expect(geo.features).is.lengthOf(8843);
      //       expect(geo.features[0]).has.property('properties');
      //       expect(geo.features[0].properties).has.property('DMSLAT', 443312);
      //    }),

      mock.loadFile('atv.kmz')
         .then(kml.fromKMZ)
         .then(geoJSON.featuresFromKML('Idaho Parks & Recreation'))
         .then(geo => {
            expect(geo).to.exist;
         })
   ])); //.timeout(15000);
});