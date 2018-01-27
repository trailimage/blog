const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../../lib/factory/').default;
const library = require('../../lib/library').default;
/** @type {Post} */
let post = null;

factory.inject.flickr = require('../mocks/flickr.mock');

describe('Photos', () => {
   before(() =>
      factory.buildLibrary().then(() => {
         post = library.postWithID('72157666685116730');
         return post.getPhotos();
      })
   );

   it('are lazy-loaded from post', () => {
      expect(post.photos).is.lengthOf(13);
   });

   it('have normalized attributes', () => {
      const p = post.photos.find(p => p.id == '8458410907');

      expect(p.title).equals('Heroic ascent');
      expect(p.tags).to.include('Brenna Abbott');
      expect(p.latitude).is.within(-90, 90);
      expect(p.longitude).is.within(-180, 180);
   });

   it('have certain sizes', () => {
      const p = post.photos.find(p => p.id == '8458410907');

      expect(p.size).to.contain.all.keys(['big', 'normal', 'preview']);
      expect(p.size.big.height).equals(2048);
   });

   // https://www.flickr.com/services/api/explore/flickr.photos.getExif
   it('can retrieve EXIF', () =>
      library.getEXIF('8459503474').then(exif => {
         expect(exif).to.exist;
         expect(exif).has.property('ISO', 400);
         expect(exif).has.property('artist', 'Jason Abbott');
         expect(exif).has.property('model', 'Nikon D700');
         expect(exif).has.property('fNumber', 5.6);
         expect(exif).has.property('time', '1/10');
      }));

   it('have one designated as primary', () => {
      expect(post.photos.find(p => p.primary)).to.exist;
   });
});
