'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Photo Size Model', ()=> {
	let s = new lib.PhotoSize();

	it('indicates if values are empty', ()=> {
		expect(s.empty).is.true;

		s.url = 'anything';
		s.width = 10;

		expect(s.empty).is.false;
	});
});