import factory from './factory';
import library from './library';

factory.inject.flickr = require('./mocks/flickr.mock');

beforeAll(() => factory.buildLibrary());

test('is created by factory', () => {
   expect(library.loaded).toBe(true);
});

test('has root categories', () => {
   expect(library.categories).to.contain.all.keys([
      'What',
      'When',
      'Where',
      'Who'
   ]);
});

test('returns category for key', () => {
   const what = library.categoryWithKey('what');
   expect(what).toBeDefined();
   expect(what.title).toBe('What');
   expect(what.isChild).toBe(false);
   expect(what.isParent).toBe(true);

   const bicycle = library.categoryWithKey('what/bicycle');
   expect(bicycle).toBeDefined();
   expect(bicycle.title).toBe('Bicycle');
   expect(bicycle.isChild).toBe(true);
   expect(bicycle.isParent).toBe(false);
});

test('returns keys for category', () => {
   const all = library.categoryKeys();
   const two = library.categoryKeys(['When', 'Bicycle']);

   expect(all).toHaveLength(62);
   expect(all).to.include('what/jeep-wrangler');

   expect(two).toHaveLength(2);
   expect(two).to.include('what/bicycle');
});

test('includes all photo tags with their full names', () => {
   expect(library.tags).to.contain.all.keys([
      'algae',
      'andersonranchreservoir',
      'dam',
      'horse',
      'jason'
   ]);
   expect(library.tags['andersonranchreservoir']).toBe(
      'Anderson Ranch Reservoir'
   );
});

test('has post summaries', () => {
   expect(library.posts).toHaveLength(168);
});

test('finds posts by ID or key', () => {
   const post1 = library.postWithID('72157666685116730');

   expect(post1).toBeDefined();
   expect(post1.title).toBe('Spring Fish & Chips');
   expect(post1.photoCount).toBe(13);

   const post2 = library.postWithKey('owyhee-snow-and-sand/lowlands');

   expect(post2).toBeDefined();
   expect(post2.title).toBe('Owyhee Snow and Sand');
   expect(post2.subTitle).toBe('Lowlands');
   expect(post2.photoCount).toBe(13);
});

test('removes posts', () => {
   let post = library.postWithKey('owyhee-snow-and-sand/lowlands');
   expect(post).toBeDefined();
   library.remove(post.key);
   post = library.postWithKey('owyhee-snow-and-sand/lowlands');
   expect(post).not.toBeDefined();
});

test('finds post having a photo', () =>
   library.getPostWithPhoto('8459503474').then(post => {
      expect(post).toBeDefined();
      expect(post).toHaveProperty('id', '72157632729508554');
   }));

test('finds photos with tags', () =>
   library.getPhotosWithTags('horse').then(photos => {
      expect(photos).toBeDefined();
      expect(photos).is.instanceOf(Array);
      expect(photos).to.have.length.above(10);
      expect(photos[0]).to.contain.all.keys(['id', 'size']);
   }));

test('creates list of post keys', () => {
   const keys = library.postKeys();
   expect(keys).toHaveLength(167);
   expect(keys).to.include('brother-ride-2015/simmons-creek');
});

test('can be emptied', () => {
   library.empty();
   expect(library.loaded).toBe(false);
   expect(library.posts).is.empty;
});
