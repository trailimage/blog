'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');
const library = require('../lib/library');

factory.inject.flickr = require('./mocks/flickr.mock');

describe('Library', ()=> {
   before(() => factory.buildLibrary());

   it('is created by factory', ()=> {
      expect(library.loaded).is.true;
   });

   it('has root categories', ()=> {
      expect(library.categories).to.contain.all.keys(['What','When','Where','Who']);
   });

   it('returns category for key', ()=> {
      const what = library.categoryWithKey('what');
      expect(what).to.exist;
      expect(what.title).equals('What');
      expect(what.isChild).is.not.true;
      expect(what.isParent).is.true;

      const bicycle = library.categoryWithKey('what/bicycle');
      expect(bicycle).to.exist;
      expect(bicycle.title).equals('Bicycle');
      expect(bicycle.isChild).is.true;
      expect(bicycle.isParent).is.not.true;
   });

   it('returns keys for category', ()=> {
      const all = library.categoryKeys();
      const two = library.categoryKeys(['When','Bicycle']);

      expect(all).is.lengthOf(62);
      expect(all).to.include('what/jeep-wrangler');

      expect(two).is.lengthOf(2);
      expect(two).to.include('what/bicycle');
   });

   it('includes all photo tags with their full names', ()=> {
      expect(library.tags).to.contain.all.keys(['algae','andersonranchreservoir','dam','horse','jason']);
      expect(library.tags['andersonranchreservoir']).equals('Anderson Ranch Reservoir');
   });

   it('has post summaries', ()=> {
      expect(library.posts).is.lengthOf(168);
   });

   it('finds posts by ID or key', ()=> {
      const post1 = library.postWithID('72157666685116730');

      expect(post1).to.exist;
      expect(post1.title).equals('Spring Fish & Chips');
      expect(post1.photoCount).equals(13);

      const post2 = library.postWithKey('owyhee-snow-and-sand/lowlands');

      expect(post2).to.exist;
      expect(post2.title).equals('Owyhee Snow and Sand');
      expect(post2.subTitle).equals('Lowlands');
      expect(post2.photoCount).equals(13);
   });

   it('finds post having a photo', ()=> {
      return library.getPostWithPhoto('8459503474').then(post => {
         expect(post).to.exist;
         expect(post).has.property('id','72157632729508554');
      });
   });

   it('creates list of post keys', ()=> {
      const keys = library.postKeys();
      expect(keys).is.lengthOf(168);
      expect(keys).to.include('brother-ride-2015/simmons-creek');
   });

   it('can be emptied', ()=> {
      library.empty();
      expect(library.loaded).is.not.true;
      expect(library.posts).is.empty;
   });
});
