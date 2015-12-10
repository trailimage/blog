'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;
const CacheItem = lib.Cache.Item;
const pageContent = '<html><head></head><body>Test Page</body></html>';

describe('Cache Item', ()=> {

	it.skip('serializes', ()=> {
		let item = new CacheItem('slug', pageContent);
		expect(item.serialize()).equals('');
	});

	it.skip('deserializes', ()=> {

	});
});