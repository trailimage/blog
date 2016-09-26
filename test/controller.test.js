'use strict';

//region Imports

const C = require('../lib/constants');
const config = require('../lib/config');
const cache = require('../lib/cache');
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

/**
 * Expectations for JSON responses
 * @returns {String|Object} response content
 */
function expectJSON() {
   expect(res.httpStatus).equals(C.httpStatus.OK);
   expect(res.headers).has.property(C.header.content.TYPE, C.mimeType.JSON);
   expect(res.rendered).has.property('json');
   expect(res.rendered.json).has.property('success', true);
   expect(res.rendered.json).has.property('message');
   return res.rendered.json.message;
}

/**
 * Run exists() method for each key and confirm it does or does not exist
 * @param {String[]} keys
 * @param {Boolean} [exists]
 * @returns {Promise}
 */
function expectInCache(keys, exists = true) {
   return Promise
      .all(keys.map(k => cache.view.exists(k)))
      // all() returns an array of outputs from each method
      .then(results => { results.forEach(r => expect(r).equals(exists)); })
}

//endregion

describe('Controller', ()=> {
   before(done => {
      const googleMock = require('./mocks/google.mock');
      c.inject.google = googleMock;
      factory.inject.flickr = require('./mocks/flickr.mock');
      factory.inject.google = googleMock;
      factory.buildLibrary().then(() => {
         middleware.enableStatusHelpers(req, res, ()=> {
             middleware.enableViewCache(req, res, done);
         });
      });
   });

   describe('Post', ()=> {
      beforeEach(() => { res.reset(); req.reset(); });

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
         c.post.view(req, res);
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
         c.post.inSeries(req, res);
      });
   });

   describe('Photos', ()=> {
      beforeEach(() => { res.reset(); req.reset(); });

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
      beforeEach(() => { res.reset(); req.reset(); });

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
      beforeEach(() => { res.reset(); req.reset(); });

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
      beforeEach(() => { res.reset(); req.reset(); });

      const postKeys = ['stanley-lake-snow-hike','brother-ride-2015/huckleberry-lookout'];
      const mapKeys = postKeys;
      let cacheViewConfig;
      let cacheMapConfig;

      before(() => {
         cacheViewConfig = config.cache.views;
         cacheMapConfig = config.cache.maps;
         config.cache.views = config.cache.maps = true;
         // add fake views to cache if not already present
         return Promise
            .all(postKeys.map(k => cache.view.addIfMissing(k, '<html><body>' + k + '</body></html>')))
            .then(() => expectInCache(postKeys));
      });

      it('removes cached posts', done => {
         res.onEnd = ()=> {
            const msg = expectJSON();
            postKeys.forEach(k => expect(msg).to.include(k));
            expectInCache(postKeys, false).then(() => done());
         };
         req.body.selected = postKeys;
         c.cache.deleteView(req, res);
      });

      it('removes cached GeoJSON', done => {
         res.onEnd = ()=> {
            const msg = expectJSON();
            mapKeys.forEach(k => expect(msg).to.include(k));
            expectInCache(mapKeys, false).then(() => done());
         };
         req.body.selected = mapKeys;
         c.cache.deleteMap(req, res);
      });

      after(()=> {
         // restore original settings
         config.cache.views = cacheViewConfig;
         config.cache.maps = cacheMapConfig;
      })
   });

   describe('RSS', ()=> {
      beforeEach(() => { res.reset(); req.reset(); });

      it('generates valid RSS 2.0 XML', ()=> {
         const Feed = require('feed');
         const nl = '\n';
         const tab = '    ';
         const updated = new Date();
         const authorName = 'Test Person';
         const title = 'Feed Title';
         const description = 'Feed Description';
         const url = 'http://www.domain.com';
         const image = 'http://www.domain.com/img/logo.png';
         const author = { name: authorName, link: 'https://www.facebook.com/test.person' };
         const copyright = 'Copyright © ' + updated.getFullYear() + ' ' + authorName + '. All rights reserved';
         let feed = new Feed({
            title: title,
            description: description,
            link: url,
            image: image,
            copyright: copyright,
            author: author,
            updated: updated
         });
         let source = feed.render('rss-2.0');
         let target = '<?xml version="1.0" encoding="utf-8"?>' + nl
            + '<rss version="2.0">' + nl
            + tab + '<channel>' + nl
            + tab + tab + '<title>' + title + '</title>' + nl
            + tab + tab + '<description>' + description + '</description>' + nl
            + tab + tab + '<link>' + url + '</link>' + nl
            + tab + tab + '<lastBuildDate>' + updated.toUTCString() + '</lastBuildDate>' + nl
            + tab + tab + '<docs>http://blogs.law.harvard.edu/tech/rss</docs>' + nl
            + tab + tab + '<image>' + nl
            + tab + tab + tab + '<title>' + title + '</title>' + nl
            + tab + tab + tab + '<url>' + image + '</url>' + nl
            + tab + tab + tab + '<link>' + url + '</link>' + nl
            + tab + tab + '</image>' + nl
            + tab + tab + '<copyright>' + copyright + '</copyright>' + nl
            + tab + tab + '<generator>Feed for Node.js</generator>' + nl
            + tab + '</channel>' + nl
            + '</rss>';

         expect(source).equals(target);
      });
   });

   describe('Administration', ()=> {
      beforeEach(() => { res.reset(); req.reset(); });

      it('renders page with supporting data', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.ADMINISTRATION);
            expect(res.headers).has.property('Cache-Control', 'no-cache, no-store, must-revalidate');
            expect(res.headers).has.property('Pragma', 'no-cache');
            expect(res.headers).has.property('Expires', 0);
            expect(options).to.contain.all.keys(['json','library','logs','maps','views']);
            done();
         };
         c.admin.home(req, res);
      });

      it('invalidates caches while updating library', done => {
         res.onEnd = ()=> {
            const msg = expectJSON();
            expect(msg).to.exist;
            done();
         };
         c.admin.updateLibrary(req, res);
      })
   });

   describe('Map', ()=> {
      beforeEach(() => { res.reset(); req.reset(); });

      it('displays map for post', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.MAP);
            expect(options).has.property('title', 'Map');
            expect(options).has.property('key', 'kuna-cave-fails-to-impress');
            expect(options).has.property('photoID', 0);
            expect(options).has.property('post');
            expect(options.post).has.property('originalTitle', 'Kuna Cave Fails to Impress');
            done();
         };
         req.params[ph.POST_KEY] = 'kuna-cave-fails-to-impress';
         c.map.forPost(req, res);
      });

      it('displays map for series', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.MAP);
            expect(options).has.property('title', 'Map');
            expect(options).has.property('photoID', 0);
            expect(options).has.property('post');
            expect(options.post).has.property('id', '72157658679070399');
            expect(options.post).has.property('isPartial', true);
            done();
         };
         req.params[ph.SERIES_KEY] = 'brother-ride-2015';
         req.params[ph.PART_KEY] = 'huckleberry-lookout';
         c.map.forSeries(req, res);
      });

      it('loads GeoJSON for post', done => {
         res.onEnd = ()=> {
            expect(res.httpStatus).equals(C.httpStatus.OK);
            expect(res.headers).has.property(C.header.content.TYPE);
            expect(res.headers[C.header.content.TYPE]).to.include(C.mimeType.JSON);
            expect(res.headers).has.property(C.header.content.ENCODING, C.encoding.GZIP);
            expect(res.content).to.exist;
            expect(res.content).is.length.above(1000);
            done();
         };
         req.params[ph.POST_KEY] = 'stanley-lake-snow-hike';
         c.map.json(req, res);
      });

      it.skip('downloads GPX', done => {
         res.onEnd = ()=> {
            const options = expectTemplate(template.page.MAP);
            expect(options).has.property('title', 'Map');
            expect(options).has.property('photoID', 0);
            expect(options).has.property('post');
            expect(options.post).has.property('id', '72157658679070399');
            expect(options.post).has.property('isPartial', true);
            done();
         };
         req.params[ph.POST_KEY] = 'stanley-lake-snow-hike';
         c.map.download(req, res);
      });

   });
});