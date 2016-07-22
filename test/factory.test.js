'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');

factory.inject.flickr = require('./mocks/flickr.mock');

describe('Factory', ()=> {
   it('makes library', ()=> {
      return factory.buildLibrary().then(library => {
         expect(library.loaded).is.true;
      })
   });
});