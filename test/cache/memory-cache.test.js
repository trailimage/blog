'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const MemoryCache = require('../../lib/cache/memory-cache.js');
const key = 'test-key';

describe('Memory Cache', ()=> {
	let cache = new MemoryCache();

	it('stores a key and value', done => {
		cache.add(key, 'value', (err, result) => {
			expect(err).equals(MemoryCache.ErrorType.None);
			expect(result).is.true;
			done();
		});
	});

	it('removes a key and its value', done => {
		cache.remove(key, (err, result) => {
			expect(err).equals(MemoryCache.ErrorType.None);
			expect(result).equals(1);
			done();
		});
	});
});