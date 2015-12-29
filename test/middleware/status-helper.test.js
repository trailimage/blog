'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;
const statusHelper = TI.Middleware.statusHelper;

describe('Status Helper Middleware', ()=> {
	let req = new TI.Mock.Request();
	let res = new TI.Mock.Response();

	// add caching expando methods
	before(done => { statusHelper.methods(req, res, done); });

	it('finds referred client IP for hosted node instances', ()=> {
		req.connection.remoteAddress = 'remote';
		expect(req.clientIP()).equals('remote');

		req.headers['x-forwarded-for'] = 'value1, value2';
		expect(req.clientIP()).equals('value1');
	});
});