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
//region Helpers
/**
 * Expect standard Handlebars template response
 * @param {String} name Template name
 * @returns {Object}
 */
function expectTemplate(name) {
   expect(res.httpStatus).equals(C.httpStatus.OK);
   expect(res.rendered).has.property('template', name);
   expect(res.rendered).has.property('options');
   return res.rendered.options;
}

/**
 * @param {String} path Redirection target
 */
function expectRedirect(path) {
   expect(res.redirected).to.exist;
   expect(res.redirected).has.property('status', C.httpStatus.PERMANENT_REDIRECT);
   expect(res.redirected).has.property('url', path);
}

function expectJSON() {
   expect(res.httpStatus).equals(C.httpStatus.OK);
   expect(res.headers).has.property('Content-Type', C.mimeType.JSON);
   expect(res.rendered).has.property('json');
   expect(res.rendered.json).has.property('success', true);
   expect(res.rendered.json).has.property('message');
   return res.rendered.json.message;
}

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
            const options = expectTemplate(template.page.POST);
            expect(options).has.property('slug', 'stanley-lake-snow-hike');
            expect(options.layout).is.null;

            done();
         };
         c.post.home(req, res);
      });

      it('forwards to correct URL from Flickr set ID', done => {
         res.onEnd = ()=> {
            expectRedirect('/ruminations');
            done();
         };
         req.params[ph.POST_ID] = config.flickr.featureSets[0].id;
         c.post.providerID(req, res);
      });

      it('shows post with slug', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.POST);
            expect(options).has.property('title', 'Kuna Cave Fails to Impress');
            expect(options).has.property('post');
            expect(options.post).has.property('id', '72157668896453295');
            expect(options.post).has.property('isPartial', false);
            done();
         };
         req.params[ph.POST_KEY] = 'kuna-cave-fails-to-impress';
         c.post.view(req, res);
      });

      it('shows post in series', done => {
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
         c.post.inSeries(req, res);
      });

      // it.skip('forwards old blog paths to new location', ()=> {
      //    req.params[ph.YEAR] = '2014';
      //    req.params[ph.MONTH] = '08';
      //    req.params[ph.POST_KEY] = 'post-slug';
      //    c.post.date(req, res);
      //    expect(res.redirected.status).equals(C.httpStatus.TEMP_REDIRECT);
      //    expect(res.redirected.url).equals(`http://${config.blog.domain}/${req.params[ph.YEAR]}/${req.params[ph.MONTH]}/${req.params[ph.POST_KEY]}`)
      // });
      //
      // it.skip('forwards deprecated slugs to new location', ()=> {
      //    // TODO this happens in the app route config, not controller
      //    const oldPostKey = 'great-post';
      //
      //    config.blog = {
      //       domain: 'blog.test.com',
      //       redirects: { [oldPostKey]: 'still-a-great-post' }
      //    };
      //
      //    req.params[ph.POST_KEY] = oldPostKey;
      //    c.post.view(req, res);
      //    expect(res.redirected.status).equals(C.httpStatus.PERMANENT_REDIRECT);
      //    expect(res.redirected.url).equals('/' + config.blog.redirects[oldPostKey]);
      // });
   });

   describe('Photos', ()=> {
      it('loads all photo tags', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.PHOTO_TAG);
            expect(options).has.property('alphabet', C.alphabet);
            expect(options).has.property('tags');
            expect(options.tags).to.contain.all.keys(['a','b','c']);
            done();
         };
         c.photo.tags(req, res);
      });

      it('redirects to post containing photo', done => {
         res.onEnd = ()=> {
            expectRedirect('/ruminations#8458410907');
            done();
         };
         req.params[ph.PHOTO_ID] = '8458410907';
         c.photo.inPost(req, res);
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
         c.photo.withTag(req, res);
      });

      it('loads EXIF', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.EXIF);
            expect(options).has.property('EXIF');
            expect(options.EXIF).to.contain.all.keys(['ISO','artist','lens','model']);
            expect(options.EXIF).has.property('sanitized', true);
            done();
         };
         req.params[ph.PHOTO_TAG] = '8458410907';
         c.photo.exif(req, res);
      });
   });

   describe('Category', ()=> {
      it('renders home page for default category', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.CATEGORY);
            expect(options).to.contain.all.keys(['description','headerCSS','jsonLD','posts','subtitle','title']);
            done();
         };
         c.category.home(req, res);
      });

      it('renders a list of subcategories', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.CATEGORY_LIST);
            expect(options).to.contain.all.keys(['description','headerCSS','jsonLD','subcategories','subtitle','title']);
            done();
         };
         req.params[ph.ROOT_CATEGORY] = 'what';
         c.category.list(req, res);
      });

      it('displays category at path', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.CATEGORY_LIST);
            expect(options).to.contain.all.keys(['description','headerCSS','jsonLD','subcategories','subtitle','title']);
            done();
         };
         req.params[ph.ROOT_CATEGORY] = 'when';
         req.params[ph.CATEGORY] = '2016';
         c.category.list(req, res);
      });

      it('creates category menu', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.CATEGORY_MENU);
            expect(options).to.contain.all.keys(['description','library']);
            done();
         };
         c.category.menu(req, res);
      });
   });

   describe('Menu', ()=> {
      it('builds data for main menu', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.POST_MENU_DATA);
            expect(res.headers).has.property('Vary','Accept-Encoding');
            expect(options).has.property('library');
            done();
         };
         c.menu.data(req, res);
      });

      it('renders mobile menu', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.MOBILE_MENU_DATA);
            expect(options).has.property('library');
            done();
         };
         c.menu.mobile(req, res);
      });
   });

   describe('Cache', ()=> {
      const cache = require('../lib/cache');
      const post1Key = 'stanley-lake-snow-hike';
      const post2Key = 'brother-ride-2015/huckleberry-lookout';
      let oldCacheSetting;

      before(() => {
         oldCacheSetting = config.cache.views;
         config.cache.views = true;
         // add fake views to cache if not already there
         return Promise.all([
            cache.view.addIfMissing(post1Key, '<html><body>Post 1</body></html>'),
            cache.view.addIfMissing(post2Key, '<html><body>Post 2</body></html>'),
            cache.view.exists(post1Key),
            cache.view.exists(post2Key)
         ]).then(([,,post1Exists, post2Exists ]) => {
            expect(post1Exists).is.true;
            expect(post2Exists).is.true;
         });
      });

      it('removes cached views', done => {
         res.onEnd = ()=> {
            const msg = expectJSON();
            Promise.all([
               cache.view.exists(post1Key),
               cache.view.exists(post2Key),
            ]).then(([ post1Exists, post2Exists ]) => {
               expect(post1Exists).is.not.true;
               expect(post2Exists).is.not.true;
               done();
            });
         };
         req.body.selected = [ post1Key, post2Key ];
         c.cache.deleteView(req, res);
      });

      it('renders mobile menu', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.MOBILE_MENU_DATA);
            expect(options).has.property('library');
            done();
         };
         c.menu.mobile(req, res);
      });

      after(()=> { config.cache.views = oldCacheSetting; })
   });
});