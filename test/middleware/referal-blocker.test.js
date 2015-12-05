'use strict';

const Enum = require('../../lib/enum.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const blocker = require('../../lib/middleware/referal-blocker.js');
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Referal Blocker Middleware', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	it('flags black-listed URLs', done => {
		req.referer = 'http://www.microsoft.com';

		blocker.filter(req, res, ()=> {
			expect(res.status).equals(Enum.httpStatus.notFound);
			done();
		});
	});
});