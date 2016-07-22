'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');

describe('Factory', ()=> {
   it('makes library', ()=> {
      return factory.makeLibrary().then(library => {
         expect(library.loaded).is.true;
      })
   });
});