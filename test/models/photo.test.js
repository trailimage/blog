'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Photo Model', ()=> {
	let p = new lib.Photo();
	p.tags = ['one','two','three','four five'];

	it('serializes tags', ()=> {
		expect(p.tagList).equals('one,two,three,four five');
	});
});