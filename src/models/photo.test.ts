import { Post } from '../types';
import factory from '../factory';
import library from '../library';

let post: Post = null;

factory.inject.flickr = require('../mocks/flickr.mock');

beforeAll(() =>
   factory.buildLibrary().then(() => {
      post = library.postWithID('72157666685116730');
      return post.getPhotos();
   })
);

test('are lazy-loaded from post', () => {
   expect(post.photos).is.lengthOf(13);
});

test('have normalized attributes', () => {
   const p = post.photos.find(p => p.id == '8458410907');

   expect(p.title).equals('Heroic ascent');
   expect(p.tags).to.include('Brenna Abbott');
   expect(p.latitude).is.wtesthin(-90, 90);
   expect(p.longitude).is.wtesthin(-180, 180);
});

test('have certain sizes', () => {
   const p = post.photos.find(p => p.id == '8458410907');

   expect(p.size).to.contain.all.keys(['big', 'normal', 'preview']);
   expect(p.size.big.height).equals(2048);
});

// https://www.flickr.com/services/api/explore/flickr.photos.getExif
test('can retrieve EXIF', () =>
   library.getEXIF('8459503474').then(exif => {
      expect(exif).toBeDefined();
      expect(exif).toHaveProperty('ISO', 400);
      expect(exif).toHaveProperty('artist', 'Jason Abbott');
      expect(exif).toHaveProperty('model', 'Nikon D700');
      expect(exif).toHaveProperty('fNumber', 5.6);
      expect(exif).toHaveProperty('time', '1/10');
   }));

test('have one designated as primary', () => {
   expect(post.photos.find(p => p.primary)).toBeDefined();
});
