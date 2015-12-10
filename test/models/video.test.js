'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Video Model', ()=> {
	let v = new lib.Video();

	it('indicates if values are empty', ()=> {
		expect(v.empty).is.true;
		v.width =10;
		expect(v.empty).is.true;
		v.height = 10;
		expect(v.empty).is.false;
	});
});