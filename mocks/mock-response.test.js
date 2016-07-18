'use strict';

const TI = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Mock Response', ()=> {
	let res = new TI.Mock.Response();

	it('allows setting and reading the HTTP status', ()=> {
		res.status(TI.httpStatus.notFound);
		expect(res.httpStatus).equals(TI.httpStatus.notFound);
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
		res.redirect(TI.httpStatus.permanentRedirect, 'url');
		expect(res.redirected.status).equals(TI.httpStatus.permanentRedirect);
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
		expect(res.httpStatus).equals(TI.httpStatus.notFound);
	});

	it('tracks whether response is ended', ()=> {
		res.end();
		expect(res.ended).is.true;
	});
});