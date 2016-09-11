'use strict';

//region Imports

const C = require('../lib/constants');
const config = require('../lib/config');
const res = require('./mocks/response.mock');
const req = require('./mocks/request.mock');
const middleware = require('../lib/middleware');
const factory = require('../lib/factory');
const template = require('../lib/template');
const mocha = require('mocha');
const { expect } = require('chai');
const c = require('../lib/controller');
const ph = C.route;

//endregion

describe('Controller', ()=> {
   before(done => {
      factory.inject.flickr = require('./mocks/flickr.mock');
      factory.buildLibrary().then(() => {
         middleware.enableStatusHelpers(req, res, ()=> {
             middleware.enableViewCache(req, res, done);
         });
      });
   });

   beforeEach(() => {
      res.reset();
      req.reset();
   });

   describe('Post', ()=> {
      it('shows latest', done => {
         res.onEnd = ()=> {
            expect(res.httpStatus).equals(C.httpStatus.OK);
            expect(res.rendered).has.property('template', template.page.POST);
            expect(res.rendered).has.property('options');

            const options = res.rendered.options;

            expect(options).has.property('slug', 'stanley-lake-snow-hike');
            expect(options.layout).is.null;

            done();
         };
         c.post.home(req, res);
      });

      it('forwards to correct URL from Flickr set ID', done => {
         res.onEnd = ()=> {
            expect(res.redirected).has.property('status', C.httpStatus.PERMANENT_REDIRECT);
            expect(res.redirected).has.property('url', '/ruminations');
            done();
         };
         req.params[ph.POST_ID] = config.flickr.featureSets[0].id;
         c.post.providerID(req, res);
      });

      it('shows post in series', done => {
         res.onEnd = ()=> {
            expect(res.httpStatus).equals(C.httpStatus.OK);
            expect(res.headers).has.property('Content-Encoding', 'gzip');
            expect(res.rendered).has.property('template','post');
            expect(res.rendered).has.property('options');
            expect(res.rendered.options).has.property('title', 'Brother Ride 2015');
            expect(res.rendered.options).has.property('post');
            expect(res.rendered.options.post).has.property('id', '72157658679070399');
            expect(res.rendered.options.post).has.property('chronological', true);
            done();
         };
         req.params[ph.SERIES_KEY] = 'brother-ride-2015';
         req.params[ph.PART_KEY] = 'huckleberry-lookout';
         c.post.inSeries(req, res);
      });

      it.skip('forwards old blog paths to new location', ()=> {
         req.params[ph.YEAR] = '2014';
         req.params[ph.MONTH] = '08';
         req.params[ph.POST_KEY] = 'post-slug';
         c.post.date(req, res);
         expect(res.redirected.status).equals(C.httpStatus.TEMP_REDIRECT);
         expect(res.redirected.url).equals(`http://${config.blog.domain}/${req.params[ph.YEAR]}/${req.params[ph.MONTH]}/${req.params[ph.POST_KEY]}`)
      });

      it.skip('forwards deprecated slugs to new location', ()=> {
         // TODO this happens in the app route config, not controller
         const oldPostKey = 'great-post';

         config.blog = {
            domain: 'blog.test.com',
            redirects: { [oldPostKey]: 'still-a-great-post' }
         };

         req.params[ph.POST_KEY] = oldPostKey;
         c.post.view(req, res);
         expect(res.redirected.status).equals(C.httpStatus.PERMANENT_REDIRECT);
         expect(res.redirected.url).equals('/' + config.blog.redirects[oldPostKey]);
      });
   });
});