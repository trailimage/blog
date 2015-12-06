'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Photo = require('../../lib/models/photo.js');

describe('Photo Model', ()=> {
	let p = new Photo();
	p.tags = ['one','two','three','four five'];

	it('serializes tags', ()=> {
		expect(p.tagList).equals('one,two,three,four five');
	});
});