'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Photo Model', ()=> {
	let p = new TI.Photo();
	p.tags = ['one','two','three','four five'];

	it('serializes tags', ()=> {
		expect(p.tagList).equals('one,two,three,four five');
	});
});