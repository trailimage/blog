'use strict';

const C = require('../../lib/constants');
const cache = require('../../lib/cache');
const mocha = require('mocha');
const expect = require('chai').expect;
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const blocker = require('../../lib/middleware/referral-blocker');

describe('Referral Blocker Middleware', ()=> {
	it('blocks black-listed URLs', done => {
		req.referer = 'http://2323423423.copyrightclaims.org';
		res.reset().onEnd = error => {
			expect(error).is.undefined;
			expect(res.ended).is.true;
			expect(res.httpStatus).equals(C.httpStatus.NOT_FOUND);
			done();
		};
		blocker.filter(req, res, res.onEnd);
	});

	it('allows unlisted URLs', done => {
		req.referer = 'http://microsoft.com';
		res.reset().onEnd = error => {
			expect(error).is.undefined;
			expect(res.httpStatus).not.equals(C.httpStatus.NOT_FOUND);
			done();
		};
		blocker.filter(req, res, res.onEnd);
	});

	it('caches black list', done => {
		res.reset().onEnd = ()=> {
			cache.item(blocker.cacheKey).then(value => {
			   expect(value).to.exist;
				expect(value).to.be.an('array');
				expect(value.length).at.least(100);
				done();
			});
		};
		blocker.filter(req, res, res.onEnd);
	});

	it.skip('refreshes the cache after a period of time', ()=> {
		// needs to call private method
	});
});