'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;
let e = new lib.EXIF();

describe('EXIF Model', ()=> {
	before(()=> {
		e.artist = 'Jason Abbott';
		e.model = 'ILCE-7RM2';
		e.sanitize();
	});

	it('sanitizes camera model', ()=> {
		expect(e.model).equals('Sony α7ʀ II');
	});

	it.skip('sanitizes lens description', ()=> {

	});

	it.skip('sanitizes focal length', ()=> {

	});

	it.skip('sanitizes software name', ()=> {

	});
});