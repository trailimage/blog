'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Post Model', ()=> {
	let p = new TI.Post();

	it('indicates if it has tags', ()=> {
		expect(p.hasTags).is.false;
		p.tags['whatever'] = 'anything';
		expect(p.hasTags).is.true;
	});
});