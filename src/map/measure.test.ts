import measure from './measure';
import { time } from '../constants';

function expectGeoPoint(point: number[]): number[] {
   expect(point).toBeInstanceOf(Array);
   expect(point[0]).toBeGreaterThanOrEqual(-180);
   expect(point[0]).toBeLessThanOrEqual(180);
   expect(point[1]).toBeGreaterThanOrEqual(-90);
   expect(point[1]).toBeLessThanOrEqual(90);
   return point;
}

test('converts between degrees and radians', () => {
   expect(measure.toRadians(48)).toBeCloseTo(0.8, 1);
   expect(measure.toRadians(-122)).toBeCloseTo(-2.1, 1);
});

test('calculates distance between points', () => {
   const p1 = expectGeoPoint([-122.0, 48.0]);
   const p2 = expectGeoPoint([-121.0, 49.0]);

   expect(measure.pointDistance(p1, p2)).toBeCloseTo(82, 1);

   const p3 = expectGeoPoint([-118.4081, 33.9425]);
   const p4 = expectGeoPoint([-156.4305, 20.8987]);

   expect(measure.pointDistance(p3, p4)).toBeCloseTo(2482, 1);
});

test('identifies points at the same location', () => {
   const p1 = expectGeoPoint([100, 50, 20]);
   const p2 = expectGeoPoint([100, 50, 30]);
   const p3 = expectGeoPoint([100, 51, 30]);

   expect(measure.sameLocation(p1, p2)).toBe(true);
   expect(measure.sameLocation(p1, p3)).toBe(false);
});

test('calculates speed between two points', () => {
   const p1 = expectGeoPoint([-122, 48, 0, 100]);
   const p2 = expectGeoPoint([-120, 50, 0, 100 + time.HOUR]);

   expect(measure.speed(p1, p2)).toBeCloseTo(165, 1);
});

test('calculates distance between points', () => {
   const points = [
      expectGeoPoint([-122, 48]),
      expectGeoPoint([-121, 49]),
      expectGeoPoint([-120, 50])
   ];
   expect(measure.length(points)).toBeCloseTo(165, 1);
});
