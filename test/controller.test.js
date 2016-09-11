'use strict';

//region Imports

const C = require('../lib/constants');
const config = require('../lib/config');
const res = require('./mocks/response.mock');
const req = require('./mocks/request.mock');
const viewCache = require('../lib/middleware/view-cache');
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
         viewCache.apply(req, res, done);
      });
   });

   describe('Post', ()=> {
      beforeEach(() => {
         res.reset();
         req.reset();
      });

      it.skip('forwards old blog paths to new location', ()=> {
         req.params[ph.YEAR] = '2014';
         req.params[ph.MONTH] = '08';
         req.params[ph.POST_KEY] = 'post-slug';
         c.post.date(req, res);
         expect(res.redirected.status).equals(C.httpStatus.TEMP_REDIRECT);
         expect(res.redirected.url).equals(`http://${config.blog.domain}/${req.params[ph.YEAR]}/${req.params[ph.MONTH]}/${req.params[ph.POST_KEY]}`)
      });

      it('shows latest post', done => {
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

      it('forwards deprecated slugs to new location', ()=> {
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