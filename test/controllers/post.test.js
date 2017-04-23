const C = require('../../lib/constants');
const config = require('../../lib/config');
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const template = require('../../lib/template');
const { prepare, expectTemplate, expectRedirect } = require('./index.test');
const mocha = require('mocha');
const { expect } = require('chai');
const post = require('../../lib/controllers/post');
const ph = C.route;

describe('Post', ()=> {
   before(done => prepare(done));
   beforeEach(() => { res.reset(); req.reset(); });

   it('shows latest', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.POST);
         expect(options).has.property('slug', 'stanley-lake-snow-hike');
         expect(options.layout).is.null;

         done();
      };
      post.latest(req, res);
   });

   it('forwards to correct URL from Flickr set ID', done => {
      res.onEnd = ()=> {
         expectRedirect('/ruminations');
         done();
      };
      req.params[ph.POST_ID] = config.flickr.featureSets[0].id;
      post.withID(req, res);
   });

   it('redirects to post containing photo', done => {
      res.onEnd = ()=> {
         expectRedirect('/ruminations#8458410907');
         done();
      };
      req.params[ph.PHOTO_ID] = '8458410907';
      post.withPhoto(req, res);
   });


   it('shows post with slug', done => {
      res.endOnRender = false;
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.POST);
         expect(options).has.property('title', 'Kuna Cave Fails to Impress');
         expect(options).has.property('post');
         expect(options.post).has.property('id', '72157668896453295');
         expect(options.post).has.property('isPartial', false);
         done();
      };
      req.params[ph.POST_KEY] = 'kuna-cave-fails-to-impress';
      post.withKey(req, res);
   });

   it('shows post in series', done => {
      res.endOnRender = false;
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.POST);
         expect(options).has.property('title', 'Brother Ride 2015');
         expect(options).has.property('post');
         expect(options.post).has.property('id', '72157658679070399');
         expect(options.post).has.property('isPartial', true);
         done();
      };
      req.params[ph.SERIES_KEY] = 'brother-ride-2015';
      req.params[ph.PART_KEY] = 'huckleberry-lookout';
      post.inSeries(req, res);
   });
});