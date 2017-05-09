const C = require('../../lib/constants');
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const { prepare, expectTemplate, expectRedirect } = require('./index.test');
const template = require('../../lib/template').default;
const mocha = require('mocha');
const { expect } = require('chai');
const photo = require('../../lib/controllers/photo').default;
const ph = C.route;

describe('Photos', ()=> {
   before(done => prepare(done));
   beforeEach(() => { res.reset(); req.reset(); });

   it('loads all photo tags', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.PHOTO_TAG);
         expect(options).has.property('alphabet', C.alphabet);
         expect(options).has.property('tags');
         expect(options.tags).to.contain.all.keys(['a', 'b', 'c']);
         done();
      };
      photo.tags(req, res);
   });

   it('shows all photos with tag', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.PHOTO_SEARCH);
         expect(options).has.property('photos');
         expect(options.photos).is.instanceOf(Array);
         expect(options.photos).is.length.above(10);
         done();
      };
      req.params[ph.PHOTO_TAG] = 'horse';
      photo.withTag(req, res);
   });

   it('loads EXIF', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.EXIF);
         expect(options).has.property('EXIF');
         expect(options.EXIF).to.contain.all.keys(['ISO', 'artist', 'lens', 'model']);
         expect(options.EXIF).has.property('sanitized', true);
         done();
      };
      req.params[ph.PHOTO_TAG] = '8458410907';
      photo.exif(req, res);
   });
});