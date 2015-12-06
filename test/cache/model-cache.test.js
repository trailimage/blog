'use strict';

const config = require('../mock-config.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const ModelCache = require('../../lib/cache/model-cache.js');

describe('Model Cache', ()=> {
	it('only gets cached items if caching is enabled', done => {
		config.useCache = false;

		ModelCache.getPosts((data, tree) => {
			expect(data).is.null;
			expect(tree).is.null;
			done();
		});
	});

	it.skip('can queue and flush cache items', ()=> {

	});
});