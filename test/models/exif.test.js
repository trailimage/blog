'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Exif = require('../../lib/models/exif.js');
let e = new Exif();

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