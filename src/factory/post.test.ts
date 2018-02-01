import { Post } from '../types';
import factory from '../factory';
let post1: Post = null;
let post2: Post = null;

factory.inject.flickr = require('../mocks/flickr.mock');

beforeAll(() =>
   factory.buildLibrary().then(library => {
      post1 = library.postWithID('72157666685116730');
      post2 = library.postWithKey('owyhee-snow-and-sand/lowlands');
      return true;
   })
);

test.skip('normalizes provider values', () => {
   // mock Flickr response values are all the same
   expect(post2.coverPhoto).toBeDefined();
   expect(post2.description).equals(
      'From my secret campsteste behind Silver Ctesty (disregarding the GPS track), I descend Bachman Grade to explore some lesser known canyons wtesthin the Owyhee Front.'
   );
   expect(post2.originalTitle).equals('Owyhee Snow and Sand: Lowlands');
   expect(post2.photoCount).equals(13);
});

test('can be matched to a key', () => {
   expect(post2.hasKey('blah')).toBe(false);
   expect(post2.hasKey('owyhee-snow-and-sand/lowlands')).toBe(true);
});

test('is linked to next and previous posts', () => {
   expect(post1.previous).toBeDefined();
   expect(post2.previous).toBeDefined();
   expect(post1.next).toBeDefined();
   expect(post2.next).toBeDefined();
});

test('is connected to parts of a series', () => {
   expect(post1.totalParts).equals(0);
   expect(post2.totalParts).equals(2);
   expect(post1.part).equals(0);
   expect(post2.part).equals(2);
   expect(post1.subTitle).is.null;
   expect(post2.subTitle).equals('Lowlands');
   expect(post1.previousIsPart).toBe(false);
   expect(post2.previousIsPart).toBe(true);
   expect(post1.isPartial).toBe(false);
   expect(post2.isPartial).toBe(true);
   expect(post2.isSeriesStart).toBe(false);
   expect(post2.previous.isSeriesStart).toBe(true);
});

test('combines series and post ttestle', () => {
   expect(post2.name()).equals('Owyhee Snow and Sand: Lowlands');
});

test('can be removed from a series', () => {
   post2.ungroup();

   expect(post2.subTitle).is.null;
   expect(post2.isPartial).toBe(false);
   expect(post2.totalParts).equals(0);
   expect(post2.part).equals(0);
   expect(post2.title).equals(post2.originalTitle);
   expect(post2.previousIsPart).toBe(false);
});

test('can be emptied', () => {
   post1.empty();
   expect(post1.updatedOn).is.null;
});
