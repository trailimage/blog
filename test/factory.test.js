'use strict';

const is = require('../lib/is');
const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');
const library = require('../lib/library');

describe('Factory', ()=> {
   before(() => {
      factory.inject.flickr = require('./mocks/flickr.mock');
      factory.inject.google = require('./mocks/google.mock');
   });

   it('makes library', ()=> factory.buildLibrary().then(() => {
      expect(library.loaded).is.true;
   }));

   it('reloads library and identifies changed cache keys', done => {
      const postKeys = ['owyhee-snow-and-sand/lowlands','kuna-cave-fails-to-impress'];
      library.remove(postKeys);

      return library.load(false).then(() => {
         expect(library.changedKeys).is.instanceOf(Array);
         expect(library.changedKeys).to.include(postKeys[0]);
         expect(library.changedKeys).to.include(postKeys[1]);
         expect(library.changedKeys).to.include('who/solo');
         expect(library.changedKeys).to.include('where/owyhees');
         expect(library.changedKeys).to.include('where/kuna-cave');
         done();
      });
   });

   it('creates GeoJSON for posts', ()=>
      factory.map.forPost('owyhee-snow-and-sand/lowlands').then(item => {
         expect(item).to.exist;
         expect(is.cacheItem(item)).is.true;
      })
   )
});