'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Mock PDF Document', ()=> {
	let pdf = new TI.Mock.PDFDocument();

	it('records font registrations', ()=> {
		pdf.registerFont('testFont', 'font/path/name.ttf');
		expect(pdf.fonts['testFont']).equals('font/path/name.ttf');
	});
});