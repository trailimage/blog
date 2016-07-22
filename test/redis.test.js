'use strict';

const config = require('../lib/config');
const is = require('../lib/is');
const mocha = require('mocha');
const expect = require('chai').expect;
const redis = require('../lib/redis');
const key = 'test-key';

describe('Redis', ()=> {
	it('stores a key and value', done => {
		redis.add(key, 'test-value', success => {
			expect(success).is.true;
			done();
		});
   });

	it.skip('removes a key and its value', done => {
		redis.remove(key, err => {
			expect(err).is.null;
			done();
		});
	});

	after(done => { redis.disconnect(); done(); });
});