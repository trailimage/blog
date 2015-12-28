'use strict';

const TI = require('./');
const mocha = require('mocha');
const expect = require('chai').expect;
const config = TI.config;
const re = TI.re;
let text = `some
text on more
than

one line`;

describe('Patterns', ()=> {
	it('matches quote characters', ()=> {
		expect('"say"“'.replace(re.quote.any, '')).equals('say');
	});

	it('matches line breaks', ()=> {
		expect(text.replace(re.lineBreak, '-')).equals('some-text on more-than--one line')
	});

	it('matches logged paths and IP addresses', ()=> {
		let log = '/autumn-ride-to-boise/gpx not found for 10.180.57.199';
		let output = '<a href="/autumn-ride-to-boise/gpx">/autumn-ride-to-boise/gpx</a>'
			+ ' not found for <a href="' + config.log.ipLookupUrl + '10.180.57.199">10.180.57.199</a>';

		expect(links(log)).equals(output);

		log = '/8330346003 not found for 10.230.214.144';
		output = '<a href="/8330346003">/8330346003</a>'
			+ ' not found for <a href="' + config.log.ipLookupUrl + '10.230.214.144">10.230.214.144</a>';

		expect(links(log)).equals(output);
	});
});

function links(text) {
	return text
		.replace(re.log.path, (match, start, path, text) => `<a href="${path}">${path}</a>${text}`)
		.replace(re.ipAddress, (match, ip) => `<a href="${config.log.ipLookupUrl}${ip}">${ip}</a>`);
}