const measure = require('../../lib/map/measure');
const mocha = require('mocha');
const { expect } = require('chai');

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

describe('Map Measurements', ()=> {
   it('converts between degrees and radians', ()=> {
      expect(measure.toRadians(48)).within(0.83, 0.84);
      expect(measure.toRadians(-122)).within(-2.13, -2.12);
   });

   it('calculates distance between points', ()=> {
      const p1 = expectGeoPoint([-122.0, 48.0]);
      const p2 = expectGeoPoint([-121.0, 49.0]);

      expect(measure.pointDistance(p1, p2)).within(82.0, 83.0);

      const p3 = expectGeoPoint([-118.4081, 33.9425]);
      const p4 = expectGeoPoint([-156.4305, 20.8987]);

      expect(measure.pointDistance(p3, p4)).within(2482, 2483);
   });

   it('identifies points at the same location', ()=> {
      const p1 = expectGeoPoint([100, 50, 20]);
      const p2 = expectGeoPoint([100, 50, 30]);
      const p3 = expectGeoPoint([100, 51, 30]);

      expect(measure.sameLocation(p1, p2)).is.true;
      expect(measure.sameLocation(p1, p3)).is.false;
   });

   it('calculates speed between two points', ()=> {
      const p1 = expectGeoPoint([-122, 48, 0, 100]);
      const p2 = expectGeoPoint([-120, 50, 0, 100 + 1000 * 60 * 60]); // an hour later in milliseconds

      expect(measure.speed(p1, p2)).within(165, 166);
   });

   it('calculates distance between points', ()=> {
      const points = [
         expectGeoPoint([-122, 48]),
         expectGeoPoint([-121, 49]),
         expectGeoPoint([-120, 50])
      ];
      expect(measure.length(points)).within(165, 166);
   });
});
