import '@toba/test';
import { photoBlog } from '../models/photo-blog';
import { makePhotoBlog } from './index';

test('makes photo blog', async () => {
   expect(photoBlog.loaded).toBe(false);
   await makePhotoBlog();
   expect(photoBlog.loaded).toBe(true);
});

test('has root categories', () => {
   expect(photoBlog.categories).toHaveAllProperties(
      'What',
      'When',
      'Where',
      'Who'
   );
});

test('returns category for key', () => {
   const what = photoBlog.categoryWithKey('what');
   expect(what).toBeDefined();
   expect(what.title).toBe('What');
   expect(what.isChild).toBe(false);
   expect(what.isParent).toBe(true);

   const bicycle = photoBlog.categoryWithKey('what/bicycle');
   expect(bicycle).toBeDefined();
   expect(bicycle.title).toBe('Bicycle');
   expect(bicycle.isChild).toBe(true);
   expect(bicycle.isParent).toBe(false);
});

test('returns keys for category', () => {
   const all = photoBlog.categoryKeys();
   const two = photoBlog.categoryKeys(['When', 'Bicycle']);

   expect(all).toHaveLength(62);
   expect(all).toContain('what/jeep-wrangler');

   expect(two).toHaveLength(2);
   expect(two).toContain('what/bicycle');
});

test('includes all photo tags with their full names', () => {
   expect(photoBlog.tags).toHaveAllProperties(
      'algae',
      'andersonranchreservoir',
      'dam',
      'horse',
      'jason'
   );
   expect(photoBlog.tags['andersonranchreservoir']).toBe(
      'Anderson Ranch Reservoir'
   );
});

test('has post summaries', () => {
   expect(photoBlog.posts).toHaveLength(168);
});

test('finds posts by ID or key', () => {
   const post1 = photoBlog.postWithID('72157666685116730');

   expect(post1).toBeDefined();
   expect(post1.title).toBe('Spring Fish & Chips');
   expect(post1.photoCount).toBe(13);

   const post2 = photoBlog.postWithKey('owyhee-snow-and-sand/lowlands');

   expect(post2).toBeDefined();
   expect(post2.title).toBe('Owyhee Snow and Sand');
   expect(post2.subTitle).toBe('Lowlands');
   expect(post2.photoCount).toBe(13);
});

test('removes posts', () => {
   let post = photoBlog.postWithKey('owyhee-snow-and-sand/lowlands');
   expect(post).toBeDefined();
   photoBlog.remove(post.key);
   post = photoBlog.postWithKey('owyhee-snow-and-sand/lowlands');
   expect(post).not.toBeDefined();
});

test('finds post having a photo', async () => {
   const post = await photoBlog.getPostWithPhoto('8459503474');
   expect(post).toBeDefined();
   expect(post).toHaveProperty('id', '72157632729508554');
});

test('finds photos with tags', async () => {
   const photos = await photoBlog.getPhotosWithTags('horse');
   expect(photos).toBeDefined();
   expect(photos).toBeInstanceOf(Array);
   expect(photos).toHaveLength(10);
   expect(photos[0]).toHaveAllProperties('id', 'size');
});

test('creates list of post keys', () => {
   const keys = photoBlog.postKeys();
   expect(keys).toHaveLength(167);
   expect(keys).toContain('brother-ride-2015/simmons-creek');
});

test('can be emptied', () => {
   photoBlog.empty();
   expect(photoBlog.loaded).toBe(false);
   expect(photoBlog.posts).toBeNull();
});

test('reloads library and identifies changed cache keys', async () => {
   const postKeys = [
      'owyhee-snow-and-sand/lowlands',
      'kuna-cave-fails-to-impress'
   ];
   photoBlog.remove(...postKeys);

   await makePhotoBlog(false);

   const changes = photoBlog.changedKeys;

   expect(changes).toBeInstanceOf(Array);
   expect(changes).toContain(postKeys[0]);
   expect(changes).toContain(postKeys[1]);
   expect(changes).toContain('who/solo');
   expect(changes).toContain('where/owyhees');
   expect(changes).toContain('where/kuna-cave');
});

// test('creates GeoJSON for posts', () =>
//    factory.map.track('owyhee-snow-and-sand/lowlands').then(item => {
//       expect(item).toBeDefined();
//       expect(is.cacheItem(item)).toBe(true);
//    }));
