'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const MemoryCache = require('../../lib/cache/memory-cache.js');
const hashValue = { key1: 'value1', key2: 'value2' };
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

	it('stores a kay and hash value', done => {
		cache.addAll(key, hashValue, (err, result) => {
			expect(err).equals(MemoryCache.ErrorType.None);
			expect(result).is.true;

			cache.select(key, (err, result) => {
				expect(err).equals(MemoryCache.ErrorType.None);
				expect(result).equals(hashValue);
				done();
			});
		});
	});

	it('can retrieve the value of a particular hash element', done => {
		const memberKey = 'key1';

		cache.selectMember(key, memberKey, (err, result) => {
			expect(err).equals(MemoryCache.ErrorType.None);
			expect(result).equals(hashValue[memberKey]);
			done();
		});
	});

	it('indicates when a hash element is not found', done => {
		cache.selectMember(key, 'no-key', (err, result) => {
			expect(err).equals(MemoryCache.ErrorType.NotFound);
			done();
		});
	});
});