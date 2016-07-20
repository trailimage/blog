'use strict';

const map = require('../lib/map');
const mocha = require('mocha');
const expect = require('chai').expect;
const DOM = require('xmldom').DOMParser;

describe('Map', ()=> {
   const gpx = map.gpx;
	const xml = new DOM().parseFromString('<trkpt lat="43.238334" lon="-116.366600">'
		+ '<ele>926.90</ele>'
		+ '<time>2013-11-02T18:54:59Z</time>'
		+ '<fix>3d</fix>'
		+ '</trkpt>');

	it('returns first node of given type', ()=> {
		let node = gpx.firstNode(xml, 'trkpt');
		expect(node).is.not.empty;
	});

	it('converts XML attributes to numbers', ()=> {
		let node = gpx.firstNode(xml, 'trkpt');
		expect(gpx.numberAttribute(node, 'lat')).equals(43.238334);
		expect(gpx.numberAttribute(node, 'lon')).equals(-116.3666);
	});

	it('returns node content', ()=> {
		let node = gpx.firstNode(xml, 'ele');
		expect(gpx.value(node)).equals('926.90');
	});

   it('creates geojson feature collection', ()=> {
      const f = map.features();
      expect(f.type).equals(map.type.COLLECTION);
      expect(f.hasOwnProperty('features')).is.true;
   });

   it('calculates distance between points', ()=> {
      const p1 = [48.0, -122.0];
      const p2 = [49.0, -121.0];

      expect(map.pointDistance(p1, p2)).within(82, 83);

      const p3 = [33.9425, -118.4081];
      const p4 = [20.8987, -156.4305];

      expect(map.pointDistance(p3, p4)).within(2482, 2483);
   });

   it('identifies points at the same location', ()=> {
      const p1 = [100, 100, 20];
      const p2 = [100, 100, 30];
      const p3 = [100, 101, 30];

      expect(map.sameLocation(p1, p2)).is.true;
      expect(map.sameLocation(p1, p3)).is.false;
   });

   it('calculates speed between two points', ()=> {
      const p1 = [48, -122, 0, 100];
      const p2 = [50, -120, 0, 100 + 1000 * 60 * 60]; // an hour later in milliseconds

      expect(map.speed(p1, p2)).within(165, 166);
   });

   it('calculates distance between points', ()=> {
      const points = [
         [48, -122],
         [49, -121],
         [50, -120]
      ];
      expect(map.length(points)).within(165, 166);
   });
});
