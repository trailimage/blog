'use strict';

const res = require('./response.mock');
const mocha = require('mocha');
const expect = require('chai').expect;
const C = require('../../lib/constants');

describe('Mock Response', ()=> {
	it('allows setting and reading the HTTP status', ()=> {
		res.status(C.httpStatus.NOT_FOUND);
		expect(res.httpStatus).equals(C.httpStatus.NOT_FOUND);
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

	it('captures redirects', ()=> {
		res.redirect(C.httpStatus.PERMANENT_REDIRECT, 'url');
		expect(res.redirected.status).equals(C.httpStatus.PERMANENT_REDIRECT);
		expect(res.redirected.url).equals('url');
	});

	it('simulates template rendering', done => {
		res.render('template', { key1: 'value1', key2: 'value2' }, (err, text) => {
			expect(err).is.null;
			expect(res.rendered.template).equals('template');
			done();
		});
	});

	it('provides a 404 convenience method', ()=> {
		res.notFound();
		expect(res.httpStatus).equals(C.httpStatus.NOT_FOUND);
	});

	it('tracks whether response is ended', ()=> {
		res.end();
		expect(res.ended).is.true;
	});
});