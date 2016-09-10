'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const C = require('../../lib/constants');
const config = require('../../lib/config');
const viewCache = require('../../lib/middleware/view-cache');
const cache = require('../../lib/cache');
const req = require('../mocks/request.mock');
const res = require('../mocks/response.mock');

describe('View Cache Middleware', ()=> {
	const viewSlug = 'test-slug';
	const pageContent = '<html><head></head><body>Test Page</body></html>';

   config.cache.views = true;

	// remove any left-over test data and add caching expando methods
	before(done => {
	   cache.view.remove(viewSlug).then(() => { viewCache.apply(req, res, done); });
	});

   it('compresses new pages and adds to cache', done => {
      res.onEnd = ()=> {
         cache.view.item(viewSlug).then(item => {
            expect(item).to.exist;
            expect(item.eTag).to.contain(viewSlug);
            expect(item.buffer).has.length.above(1000);
            done();
         });
      };
      res.sendView(viewSlug, render => {
         // mock response echoes back parameters instead of rendering view
         render('test-template', { option1: 'value1', option2: 'value2' });
      });
   });

	it('sends already rendered pages from cache', done => {
	   res.reset().onEnd = done;
		res.sendView(viewSlug, ()=> {
			throw new Error('Attempt to render page that should be cached');
		});
	});

	it('adds caching headers to compressed content', ()=> {
		const item = cache.view.create(viewSlug, pageContent);
		res.reset().sendCompressed(C.mimeType.HTML, item);

		expect(res.headers['Cache-Control']).equals('max-age=86400, public');
		expect(res.headers['ETag']).to.contain(viewSlug);
		expect(res.content).equals(item.buffer);
	});

	// remove test page from cache
	after(() => res.removeFromCache(viewSlug));
});