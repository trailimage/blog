'use strict';

const ld = require('../lib/json-ld');
const mocha = require('mocha');
const expect = require('chai').expect;
const factory = require('../lib/factory');
/** @type {Post} */
let post = null;
/** @type {Category} */
let category = null;

factory.inject.flickr = require('./mocks/flickr.mock');

describe('JSON-LD', ()=> {
   before(() => factory.buildLibrary().then(library => {
      post = library.postWithID('72157666685116730');
      category = library.categoryWithKey('what');
      return true;
   }));

   it('creates link data for posts', ()=> {
      const x = ld.fromPost(post);
      let y = x;
   });
});