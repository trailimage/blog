'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Video = require('../../lib/models/video.js');

describe('Video Model', ()=> {
	let v = new Video();

	it('indicates if values are empty', ()=> {
		expect(v.empty).is.true;
		v.width =10;
		expect(v.empty).is.true;
		v.height = 10;
		expect(v.empty).is.false;
	});
});