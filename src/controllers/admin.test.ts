import admin from './admin';
import template from '../template';
import config from '../config';
import cache from '../cache';

const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const {
   prepare,
   expectTemplate,
   expectJSON,
   expectInCache
} = require('./index.test');

const postKeys = [
   'stanley-lake-snow-hike',
   'brother-ride-2015/huckleberry-lookout'
];
const mapKeys = postKeys;
let cacheViewConfig;
let cacheMapConfig;

before(done => prepare(done));
beforeEach(() => {
   res.reset();
   req.reset();
});

test('renders page with supporting data', done => {
   res.onEnd = () => {
      const options = expectTemplate(template.page.ADMINISTRATION);
      expect(res.headers).has.property(
         'Cache-Control',
         'no-cache, no-store, must-revalidate'
      );
      expect(res.headers).has.property('Pragma', 'no-cache');
      expect(res.headers).has.property('Expires', 0);
      expect(options).to.contain.all.keys([
         'apis',
         'library',
         'logs',
         'maps',
         'views'
      ]);
      done();
   };
   admin.home(req, res);
});

test('invalidates caches while updating library', done => {
   res.onEnd = () => {
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
   return Promise.all(
      postKeys.map(k =>
         cache.view.addIfMissing(k, '<html><body>' + k + '</body></html>')
      )
   ).then(() => expectInCache(postKeys));
});

test('removes cached posts', done => {
   res.onEnd = () => {
      const msg = expectJSON();
      postKeys.forEach(k => expect(msg).to.include(k));
      expectInCache(postKeys, false).then(() => done());
   };
   req.body.selected = postKeys;
   admin.cache.deleteView(req, res);
});

test('removes cached GeoJSON', done => {
   res.onEnd = () => {
      const msg = expectJSON();
      mapKeys.forEach(k => expect(msg).to.include(k));
      expectInCache(mapKeys, false).then(() => done());
   };
   req.body.selected = mapKeys;
   admin.cache.deleteMap(req, res);
});

after(() => {
   // restore original settings
   config.cache.views = cacheViewConfig;
   config.cache.maps = cacheMapConfig;
});
