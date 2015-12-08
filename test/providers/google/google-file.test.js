'use strict';

const config = require('../../mock-config.js');
const mocha = require('mocha');
const expect = require('chai').expect;
const GoogleFile = require('../../../lib/providers/google/google-file.js');
const OAuthOptions = require('../../../lib/auth/oauth-options.js');

describe('Google File Provider', ()=> {
	let drive = new GoogleFile({
		apiKey: config.env('GOOGLE_DRIVE_KEY'),
		tracksFolder: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
		auth: new OAuthOptions(2,
			config.env('GOOGLE_CLIENT_ID'),
			config.env('GOOGLE_SECRET'),
			`http://www.${config.domain}/auth/google`,
			process.env['GOOGLE_ACCESS_TOKEN'],
			process.env['GOOGLE_REFRESH_TOKEN'])
	});

	it('authenticates Google Drive access', done => {
		drive.auth.verify(ready => {
			expect(ready).is.true;
			done();
		})
	});


	it.skip('converts a GPX file to GeoJSON', ()=> {

	});
});