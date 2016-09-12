'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');
const library = require('../lib/library');

describe('Factory', ()=> {
   before(() => {
      factory.inject.flickr = require('./mocks/flickr.mock');
   });

   it('makes library', ()=> factory.buildLibrary().then(() => {
      expect(library.loaded).is.true;
   }));

   it('reloads library and identifies changed cache keys', done => {
      const postKeys = ['owyhee-snow-and-sand/lowlands','kuna-cave-fails-to-impress'];
      library.remove(postKeys);

      return library.load(false).then(changedKeys => {
         expect(changedKeys).to.exist;
         expect(changedKeys).to.include(postKeys[0]);
         expect(changedKeys).to.include(postKeys[1]);
         expect(changedKeys).to.include('who/solo');
         expect(changedKeys).to.include('where/owyhees');
         expect(changedKeys).to.include('where/kuna-cave');
         done();
      });
   })
});