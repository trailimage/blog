const is = require('../lib/is');
const mocha = require('mocha');
const expect = require('chai').expect;
let u;   // undefined

describe('Identity Evaluations', ()=> {
   it('identifies undefined variables', ()=> {
      expect(is.value(u)).is.false;
      expect(is.value(null)).is.false;
      expect(is.value('whatever')).is.true;
   });

   it('identifies strings of numbers', ()=> {
      expect(is.numeric('abc2')).is.false;
      expect(is.numeric('1')).is.true;
      expect(is.numeric(123)).is.true;
      expect(is.numeric('29865963426')).is.true;
   });

   it('identifies numbers', ()=> {
      expect(is.number(u)).is.false;
      expect(is.number(1)).is.true;
      expect(is.number(-98091)).is.true;
      expect(is.number(1.0)).is.true;
      expect(is.number('1.0')).is.false;
   });
   it('identifies integers', ()=> {
      expect(is.integer(u)).is.false;
      expect(is.integer(1)).is.true;
      expect(is.number(-98091)).is.true;
      expect(is.integer(1.2)).is.false;
      expect(is.integer('1.0')).is.false;
   });
   it('identifies big integers', ()=> {
      expect(is.int64(u)).is.false;
      expect(is.int64(1)).is.false;
      expect(is.int64(-99)).is.false;
      expect(is.int64(98888)).is.true;
      expect(is.int64(-93338)).is.true;
      expect(is.int64(1.2)).is.false;
      expect(is.int64('1.0')).is.false;
   });
   it('identifies empty strings', ()=> {
      expect(is.empty(u)).is.true;
      expect(is.empty(' ')).is.false;
      expect(is.empty('')).is.true;
      expect(is.empty(null)).is.true;
   });
   it('identifies arrays', ()=> {
      expect(is.array(u)).is.false;
      expect(is.array([])).is.true;
      expect(is.array(new Array())).is.true;
      expect(is.array(null)).is.false;
   });
   it('identifies functions', ()=> {
      expect(is.callable(u)).is.false;
      expect(is.callable(() => 3)).is.true;
      expect(is.callable(function() { return 2; })).is.true;
      expect(is.callable(is)).is.false;
   });
   it('identifies cache items', ()=> {
      const notItem = { nope: false };
      const item = { buffer: new Buffer(''), eTag: 'some value' };
      expect(is.cacheItem()).is.false;
      expect(is.cacheItem(notItem)).is.false;
      expect(is.cacheItem(item)).is.true;
   });
});