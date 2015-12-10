'use strict';

const lib = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;
const blocker = lib.Middleware.referralBlocker;
const Mock = lib.Mock;

describe('Referral Blocker Middleware', ()=> {
	let req = new Mock.Request();
	let res = new Mock.Response();

	it('blocks black-listed URLs', done => {
		req.referer = 'http://2323423423.copyrightclaims.org';
		res.testCallback = error => {
			expect(error).is.undefined;
			expect(res.ended).is.true;
			expect(res.httpStatus).equals(lib.enum.httpStatus.notFound);
			done();
		};
		blocker.filter(req, res, res.testCallback);
	});

	it('allows unlisted URLs', done => {
		res = new Mock.Response();
		req.referer = 'http://microsoft.com';
		res.testCallback = error => {
			expect(error).is.undefined;
			expect(res.httpStatus).not.equals(lib.enum.httpStatus.notFound);
			done();
		};
		blocker.filter(req, res, res.testCallback);
	});

	it('caches black list', done => {
		const db = lib.provider;

		res = new Mock.Response();
		res.testCallback = ()=> {
			db.cache.getObject('spam-referer', value => {
				expect(value).to.be.a('array');
				expect(value.length).at.least(100);
				done();
			});
		};
		blocker.filter(req, res, res.testCallback);
	});

	it.skip('refreshes the cache after a period of time', ()=> {
		// needs to call private method
	});
});