import is from '../is';
import factory from '../factory';
import library from '../library';

beforeAll(() =>
   Promise.all([
      import('../_mocks/flickr.mock').then(f => {
         factory.inject.flickr = f;
      }),
      import('../_mocks/google.mock').then(g => {
         factory.inject.google = g;
      })
   ])
);

test('makes library', () =>
   factory.buildLibrary().then(() => {
      expect(library.loaded).toBe(true);
   }));

test('reloads library and identifies changed cache keys', () => {
   const postKeys = [
      'owyhee-snow-and-sand/lowlands',
      'kuna-cave-fails-to-impress'
   ];
   library.remove(postKeys);

   return library.load(false).then(() => {
      expect(library.changedKeys).is.instanceOf(Array);
      expect(library.changedKeys).to.include(postKeys[0]);
      expect(library.changedKeys).to.include(postKeys[1]);
      expect(library.changedKeys).to.include('who/solo');
      expect(library.changedKeys).to.include('where/owyhees');
      expect(library.changedKeys).to.include('where/kuna-cave');
   });
});

test('creates GeoJSON for posts', () =>
   factory.map.track('owyhee-snow-and-sand/lowlands').then(item => {
      expect(item).toBeDefined();
      expect(is.cacheItem(item)).toBe(true);
   }));
