'use strict';

const map = require('../lib/map');
const mocha = require('mocha');
const { expect } = require('chai');
const DOM = require('xmldom').DOMParser;
const google = require('./mocks/google.mock');

/**
 * @param {Number[]} point
 * @returns {Number[]}
 */
function expectGeoPoint(point) {
   expect(point).is.instanceOf(Array);
   expect(point[0]).within(-180, 180);
   expect(point[1]).within(-90, 90);
   return point;
}

describe('Map', ()=> {
   const gpx = map.gpx;
	const xml = new DOM().parseFromString('<trkpt lat="43.238334" lon="-116.366600">'
		+ '<ele>926.90</ele>'
		+ '<time>2013-11-02T18:54:59Z</time>'
		+ '<fix>3d</fix>'
		+ '</trkpt>');

	it('returns first node of given type', ()=> {
		const node = gpx.firstNode(xml, 'trkpt');
		expect(node).is.not.empty;
	});

	it('converts XML attributes to numbers', ()=> {
      const node = gpx.firstNode(xml, 'trkpt');
		expect(gpx.numberAttribute(node, 'lat')).equals(43.238334);
		expect(gpx.numberAttribute(node, 'lon')).equals(-116.3666);
	});

	it('returns node content', ()=> {
      const node = gpx.firstNode(xml, 'ele');
		expect(gpx.value(node)).equals('926.90');
	});

   it('converts between degrees and radians', ()=> {
      expect(map.toRadians(48)).within(0.83, 0.84);
      expect(map.toRadians(-122)).within(-2.13, -2.12);
   });

   it('creates GeoJSON feature collection', ()=> {
      const f = map.features();
      expect(f.type).equals(map.type.COLLECTION);
      expect(f).has.property('features');
   });

   it('calculates distance between points', ()=> {
      const p1 = expectGeoPoint([-122.0, 48.0]);
      const p2 = expectGeoPoint([-121.0, 49.0]);

      expect(map.pointDistance(p1, p2)).within(82.0, 83.0);

      const p3 = expectGeoPoint([-118.4081, 33.9425]);
      const p4 = expectGeoPoint([-156.4305, 20.8987]);

      expect(map.pointDistance(p3, p4)).within(2482, 2483);
   });

   it('identifies points at the same location', ()=> {
      const p1 = expectGeoPoint([100, 50, 20]);
      const p2 = expectGeoPoint([100, 50, 30]);
      const p3 = expectGeoPoint([100, 51, 30]);

      expect(map.sameLocation(p1, p2)).is.true;
      expect(map.sameLocation(p1, p3)).is.false;
   });

   it('calculates speed between two points', ()=> {
      const p1 = expectGeoPoint([-122, 48, 0, 100]);
      const p2 = expectGeoPoint([-120, 50, 0, 100 + 1000 * 60 * 60]); // an hour later in milliseconds

      expect(map.speed(p1, p2)).within(165, 166);
   });

   it('calculates distance between points', ()=> {
      const points = [
         expectGeoPoint([-122, 48]),
         expectGeoPoint([-121, 49]),
         expectGeoPoint([-120, 50])
      ];
      expect(map.length(points)).within(165, 166);
   });

   it('converts GPX files to GeoJSON', ()=> {
      const post = { key: 'whatever' };
      return google.drive.loadGPX(post).then(map.featuresFromGPX).then(geo => {
         expect(geo).to.exist;
         expect(geo).has.property('type', map.type.COLLECTION);
         expect(geo).has.property('features');
         expect(geo.features).is.instanceOf(Array);
         expect(geo.features).is.lengthOf(4);

         const first = geo.features[0];
         expect(first).to.contain.all.keys(['geometry','properties']);
         expect(first.geometry).has.property('type', map.type.LINE);
         expect(first.geometry).has.property('coordinates');
         expect(first.geometry.coordinates).is.instanceOf(Array);
         expect(first.geometry.coordinates).is.length.above(200);
         expect(first.properties).has.property('time', '2014-05-18T19:56:51Z');

         first.geometry.coordinates.forEach(expectGeoPoint);
      });
   });
});
