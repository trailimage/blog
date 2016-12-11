const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');
/** @type {Post} */
let post1 = null;
/** @type {Post} */
let post2 = null;

factory.inject.flickr = require('./mocks/flickr.mock');

describe('Post', ()=> {
   before(() => factory.buildLibrary().then(library => {
      post1 = library.postWithID('72157666685116730');
      post2 = library.postWithKey('owyhee-snow-and-sand/lowlands');
      return true;
   }));

   it.skip('normalizes provider values', ()=> {
      // mock Flickr response values are all the same
      expect(post2.coverPhoto).to.exist;
      expect(post2.description).equals('From my secret campsite behind Silver City (disregarding the GPS track), I descend Bachman Grade to explore some lesser known canyons within the Owyhee Front.');
      expect(post2.originalTitle).equals('Owyhee Snow and Sand: Lowlands');
      expect(post2.photoCount).equals(13);
   });

   it('can be matched to a key', ()=> {
      expect(post2.hasKey('blah')).is.not.true;
      expect(post2.hasKey('owyhee-snow-and-sand/lowlands')).is.true;
   });

   it('is linked to next and previous posts', ()=> {
      expect(post1.previous).to.exist;
      expect(post2.previous).to.exist;
      expect(post1.next).to.exist;
      expect(post2.next).to.exist;
   });

   it('is connected to parts of a series', ()=> {
      expect(post1.totalParts).equals(0);
      expect(post2.totalParts).equals(2);
      expect(post1.part).equals(0);
      expect(post2.part).equals(2);
      expect(post1.subTitle).is.null;
      expect(post2.subTitle).equals('Lowlands');
      expect(post1.previousIsPart).is.not.true;
      expect(post2.previousIsPart).is.true;
      expect(post1.isPartial).is.not.true;
      expect(post2.isPartial).is.true;
      expect(post2.isSeriesStart).is.not.true;
      expect(post2.previous.isSeriesStart).is.true;
   });

   it('combines series and post title', ()=> {
      expect(post2.name()).equals('Owyhee Snow and Sand: Lowlands');
   });

   it('can be removed from a series', ()=> {
      post2.ungroup();

      expect(post2.subTitle).is.null;
      expect(post2.isPartial).is.not.true;
      expect(post2.totalParts).equals(0);
      expect(post2.part).equals(0);
      expect(post2.title).equals(post2.originalTitle);
      expect(post2.previousIsPart).is.not.true;
   });

   it('can be emptied', ()=> {
      post1.empty();
      expect(post1.updatedOn).is.null;
   });
});
