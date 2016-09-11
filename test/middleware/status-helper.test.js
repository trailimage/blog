'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const res = require('../mocks/response.mock');
const req = require('../mocks/request.mock');
const statusHelper = require('../../lib/middleware/status-helper');

describe('Status Helper Middleware', ()=> {
	// add helper expando methods
	before(done => { statusHelper.apply(req, res, done); });

	it('finds referred client IP for hosted node instances', ()=> {
		req.connection.remoteAddress = 'remote';
		expect(req.clientIP()).equals('remote');

		req.headers['x-forwarded-for'] = 'value1, value2';
		expect(req.clientIP()).equals('value1');
	});
});