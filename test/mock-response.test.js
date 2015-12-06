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

	it('accepts headers', ()=> {
		res.setHeader('Cache-Control', 'no-cache');
		res.setHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
		res.setHeader('pragma', 'no-cache');

		expect(res.headers['pragma']).equals('no-cache');
	});

	it('can be written to', ()=> {
		const html = '<html><head></head><body>Test Page</body></html>';
		res.write(html);
		expect(res.content).equals(html);
	});

	it('simulates template rendering', done => {
		res.render('template', { key1: 'value1', key2: 'value2' }, (err, text) => {
			expect(err).is.null;
			expect(res.rendered.template).equals('template');
			done();
		});
	});

	it('tracks whether response is ended', ()=> {
		res.end();
		expect(res.ended).is.true;
	});
});