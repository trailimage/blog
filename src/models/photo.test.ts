import { Post, photoBlog } from './index';
import { makePhotoBlog } from '../factory/index';

let post: Post = null;

beforeAll(async () => {
   await makePhotoBlog();
   post = photoBlog.postWithID('72157666685116730');
   await post.getPhotos();
});

test('are lazy-loaded from post', () => {
   expect(post.photos).toHaveLength(13);
});

test('have normalized attributes', () => {
   const p = post.photos.find(p => p.id == '8458410907');

   expect(p.title).toBe('Heroic ascent');
   expect(p.tags).toContain('Brenna Abbott');
   expect(p.latitude).toBeWithin(-90, 90);
   expect(p.longitude).toBeWithin(-180, 180);
});

test('have certain sizes', () => {
   const p = post.photos.find(p => p.id == '8458410907');

   expect(p.size).toHaveProperty(['big', 'normal', 'preview']);
   expect(p.size.big.height).toBe(2048);
});

// https://www.flickr.com/services/api/explore/flickr.photos.getExif
test('can retrieve EXIF', async () => {
   const exif = await photoBlog.getEXIF('8459503474');

   expect(exif).toBeDefined();
   expect(exif).toHaveProperty('ISO', 400);
   expect(exif).toHaveProperty('artist', 'Jason Abbott');
   expect(exif).toHaveProperty('model', 'Nikon D700');
   expect(exif).toHaveProperty('fNumber', 5.6);
   expect(exif).toHaveProperty('time', '1/10');
});

test('have one designated as primary', () => {
   expect(post.photos.find(p => p.primary)).toBeDefined();
});
