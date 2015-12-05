'use strict';

require('../mock-config.js');
const Enum = require('../../lib/enum.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const blocker = require('../../lib/middleware/referal-blocker.js');
const MockRequest = require('../mock-request.js');
const MockResponse = require('../mock-response.js');

describe('Referal Blocker Middleware', ()=> {
	let req = new MockRequest();
	let res = new MockResponse();

	it('blocks black-listed URLs', done => {
		req.referer = 'http://2323423423.copyrightclaims.org';
		res.testCallback = error => {
			expect(error).is.undefined;
			expect(res.ended).is.true;
			expect(res.httpStatus).equals(Enum.httpStatus.notFound);
			done();
		};
		blocker.filter(req, res, res.testCallback);
	});

	it('allows unlisted URLs', done => {
		res = new MockResponse();
		req.referer = 'http://microsoft.com';
		res.testCallback = error => {
			expect(error).is.undefined;
			expect(res.httpStatus).not.equals(Enum.httpStatus.notFound);
			done();
		};
		blocker.filter(req, res, res.testCallback);
	});

	it('caches black list', done => {
		const db = require('../../lib/config.js').provider;

		res = new MockResponse();
		res.testCallback = ()=> {
			db.cache.getObject('spam-referer', value => {
				expect(value).to.be.a('array');
				expect(value.length).at.least(100);
				done();
			});
		};
		blocker.filter(req, res, res.testCallback);
	});
});