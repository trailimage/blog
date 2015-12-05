'use strict';

const Enum = require('../lib/enum.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const MockResponse = require('./mock-response.js');

describe('Mock Response', ()=> {
	let res = new MockResponse();

	it('allows setting and reading the HTTP status', ()=> {
		res.status(Enum.httpStatus.notFound);
		expect(res.httpStatus).equals(Enum.httpStatus.notFound);
	});

	it('tracks whether response is ended', ()=> {
		res.end();
		expect(res.ended).is.true;
	});
});