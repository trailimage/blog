'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Size = require('../../lib/models/size.js');

describe('Photo Size Model', ()=> {
	let s = new Size();

	it('indicates if values are empty', ()=> {
		expect(s.empty).is.true;

		s.url = 'anything';
		s.width = 10;

		expect(s.empty).is.false;
	});
});