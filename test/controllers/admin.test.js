const config = require('../../lib/config').default;
const cache = require('../../lib/cache').default;
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const { prepare, expectTemplate, expectJSON, expectInCache } = require('./index.test');
const template = require('../../lib/template').default;
const mocha = require('mocha');
const { expect } = require('chai');
const admin = require('../../lib/controllers/admin').default;
const postKeys = ['stanley-lake-snow-hike', 'brother-ride-2015/huckleberry-lookout'];
const mapKeys = postKeys;
let cacheViewConfig;
let cacheMapConfig;

describe('Administration Controller', ()=> {
   before(done => prepare(done));
   beforeEach(() => { res.reset(); req.reset(); });

   it('renders page with supporting data', done => {
      res.onEnd = ()=> {
         const options = expectTemplate(template.page.ADMINISTRATION);
         expect(res.headers).has.property('Cache-Control', 'no-cache, no-store, must-revalidate');
         expect(res.headers).has.property('Pragma', 'no-cache');
         expect(res.headers).has.property('Expires', 0);
         expect(options).to.contain.all.keys(['json', 'library', 'logs', 'maps', 'views']);
         done();
      };
      admin.home(req, res);
   });

   it('invalidates caches while updating library', done => {
      res.onEnd = ()=> {
         const msg = expectJSON();
         expect(msg).to.exist;
         done();
      };
      admin.updateLibrary(req, res);
   });


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
      admin.cache.deleteView(req, res);
   });

   it('removes cached GeoJSON', done => {
      res.onEnd = ()=> {
         const msg = expectJSON();
         mapKeys.forEach(k => expect(msg).to.include(k));
         expectInCache(mapKeys, false).then(() => done());
      };
      req.body.selected = mapKeys;
      admin.cache.deleteMap(req, res);
   });

   after(()=> {
      // restore original settings
      config.cache.views = cacheViewConfig;
      config.cache.maps = cacheMapConfig;
   });
});