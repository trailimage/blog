'use strict';

const lib = require('../');
const config = lib.config;
const mocha = require('mocha');
const expect = require('chai').expect;
const ModelCache = lib.Cache.Model;
const testValue = { key1: 'value1', key2: 'value2' };
const db = lib.provider;

describe('Model Cache', ()=> {
	it('only gets cached items if caching is enabled', done => {
		config.useCache = false;

		ModelCache.getPosts((data, tree) => {
			expect(data).is.null;
			expect(tree).is.null;
			done();
		});
	});

	it('queues post models for validation rather than caching immediately', done => {
		config.cacheOutput = true;
		ModelCache.enqueue(testValue);

		expect(ModelCache.queue[ModelCache.rootKey]).equals(JSON.stringify(testValue));

		db.cache.get(ModelCache.postsKey, value => {
			expect(value).is.null;
			done();
		});
	});

	it('flushes queued posts to the cache', done => {
		expect(ModelCache.queue[ModelCache.rootKey]).equals(JSON.stringify(testValue));
		ModelCache.flush();
		expect(ModelCache.queue).eql({});

		db.cache.get(ModelCache.postsKey, value => {
			expect(value).is.not.null;
			done();
		});
	});
});