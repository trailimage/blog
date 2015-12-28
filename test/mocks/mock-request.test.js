'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const MockRequest = require('./mock-request.js');

describe('Mock Request', ()=> {
	let req = new MockRequest();

	it('allows setting and reading the referer', ()=> {
		req.referer = 'http://2323423423.copyrightclaims.org';
		expect(req.get('referer')).equals('http://2323423423.copyrightclaims.org');
	});

	it('allows setting and reading querystring parameters', ()=> {
		req.params['key'] = 'value';
		expect(req.params['key']).equals('value');
	});
});