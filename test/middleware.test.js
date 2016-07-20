'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const { mimeType } = require('../lib/enum');
const middleware = require('../lib/middleware');
const cache = require('../lib/cache');

describe('Output Cache Middleware', ()=> {
	let req = new TI.Mock.Request();
	let res = new TI.Mock.Response();
	const viewSlug = 'test-slug';
	const pageContent = '<html><head></head><body>Test Page</body></html>';

	// add caching expando methods
	before(done => { outputCache.methods(req, res, done); });

	it.skip('sends already rendered pages from cache', done => {
		res.sendView(viewSlug, render => {
			render('test-template', { option1: 'value1', option2: 'value2' });
			done();
		});
	});

	it('adds caching headers to compressed content', ()=> {
		let item = new CacheItem(viewSlug, pageContent);
		res.sendCompressed(mimeType.html, item);

		expect(res.headers['Cache-Control']).equals('max-age=86400, public');
		expect(res.headers['ETag']).to.contain(viewSlug);
		expect(res.content).equals(item.buffer);
	});

	// remove test page from cache
	after(done => { res.removeFromCache(viewSlug, ()=> { done(); }); });
});