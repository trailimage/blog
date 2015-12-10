'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Post Model', ()=> {
	let p = new lib.Post();

	it('indicates if it has tags', ()=> {
		expect(p.hasTags).is.false;
		p.tags.push('anything');
		expect(p.hasTags).is.true;
	});
});