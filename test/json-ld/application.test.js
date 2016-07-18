'use strict';

const Schema = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Application', ()=> {
	it('extends thing', ()=> {
		let app = Schema.application({ operatingSystem: 'win95' });

		expect(app.type).equals(Schema.Type.application);
		expect(app.operatingSystem).equals('win95');
	});
});