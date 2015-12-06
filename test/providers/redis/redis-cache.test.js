'use strict';

const config = require('../../../lib/config.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const RedisCache = require('../../../lib/providers/redis/redis-cache.js');
const success = 'OK';
const key = 'test-key';

describe('Redis Cache', ()=> {
	let redis = new RedisCache(config.env('REDISCLOUD_URL'));

	it('stores a key and value', done => {
		redis.add(key, 'test-value', (err, result) => {
			expect(err).is.null;
			expect(result).equals(success);
			done();
		});
	});

	it('removes a key and its value', done => {
		redis.remove(key, err => {
			expect(err).is.null;
			done();
		});
	});

	after(done => { redis.disconnect(); done(); });
});