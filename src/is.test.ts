import is from './is';

test('identifies cache items', () => {
   const notItem = { nope: false };
   const item = { buffer: new Buffer(''), eTag: 'some value' };
   expect(is.cacheItem(null)).toBe(false);
   expect(is.cacheItem(notItem)).toBe(false);
   expect(is.cacheItem(item)).toBe(true);
});
