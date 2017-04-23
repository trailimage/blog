const mocha = require('mocha');
//const expect = require('chai').expect;
const redis = require('../../lib/providers/redis');
const key = 'test-key';

describe('Redis', ()=> {
   it('stores a key and value', ()=> redis.add(key, 'test-value'));
   it('removes a key and its value', ()=> redis.remove(key));

   after(done => { redis.disconnect(); done(); });
});