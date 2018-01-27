const is = require('../lib/is.js').default;
const mocha = require('mocha');
const expect = require('chai').expect;
let u; // undefined

describe('Identity Evaluations', () => {
   it('identifies cache items', () => {
      const notItem = { nope: false };
      const item = { buffer: new Buffer(''), eTag: 'some value' };
      expect(is.cacheItem()).is.false;
      expect(is.cacheItem(notItem)).is.false;
      expect(is.cacheItem(item)).is.true;
   });
});
