'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');

describe('Factory', ()=> {
   before(() => {
      factory.inject.flickr = require('./mocks/flickr.mock');
   });

   it('makes library', ()=> factory.buildLibrary().then(library => {
      expect(library.loaded).is.true;
   }));
});