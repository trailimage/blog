'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const format = require('../lib/format.js');
let u;   // undefined

describe('Formatting', ()=> {
	it('converts date to simple string', ()=> {
		// month value is zero-based
		expect(format.date(new Date(1973,2,15))).equals('March 15, 1973');
	});
	it('formats fractions', ()=> {
		expect(format.fraction('1/2')).equals('<sup>1</sup>&frasl;<sub>2</sub>');
	});
	it('shows AM or PM for hour of day', ()=> {
		expect(format.hourOfDay(2)).equals('AM 2');
		expect(format.hourOfDay(14)).equals('PM 2');
	});
	it.skip('formats timestamp according to ISO 8601', ()=> {

	});
	it.skip('obfuscates characters as HTML entities', ()=> {

	});
	it.skip('converts timestamp to Date', ()=> {

	});
	it.skip('ROT-13 encodes text', ()=> {

	});
	it.skip('Base 64 encodes text', ()=> {

	});
	it.skip('Base 64 decodes text', ()=> {

	});
	it('adds .remove() method to strings', ()=> {
		expect('string').to.have.property('remove');
		expect(('some text').remove('text')).equals('some ');
	});
	it('adds leading zeros to reach total digit length', ()=> {
		expect(format.leadingZeros(2, 0)).equals('2');
		expect(format.leadingZeros(2, 1)).equals('2');
		expect(format.leadingZeros(2, 2)).equals('02');
		expect(format.leadingZeros(99, 2)).equals('99');
	});
	it('substitutes placeholders for values', ()=> {
		expect(format.string('nothing')).equals('nothing');
		expect(format.string('{0} {1}', 'one', 'two')).equals('one two');
		expect(format.string('{1} {0}', 'one', 'two')).equals('two one');
	});
	it('converts number to words for number', ()=> {
		expect(format.sayNumber(3)).equals('Three');
		expect(format.sayNumber(4, false)).equals('four');
		expect(format.sayNumber(-14)).equals('-14');
		expect(format.sayNumber(20)).equals('Twenty');
		expect(format.sayNumber(21)).equals('21');
	});
	it('capitalizes first word', ()=> {
		expect(format.capitalize('one two')).equals('One two');
	});
	it('converts phrase to URL slug', ()=> {
		expect(format.slug('Wiggle and Roll')).equals('wiggle-and-roll');
		expect(format.slug('Wiggle and    Sing')).equals('wiggle-and-sing');
		expect(format.slug('Too---dashing')).equals('too-dashing');
		expect(format.slug('powerful/oz')).equals('powerful-oz');
	});
	it('creates HTML for a photo tag list', ()=> {
		expect(format.tagList(['Second','First','Third and Last'])).equals(
			'<a href="/photo-tag/first" rel="tag">First</a> <a href="/photo-tag/second" rel="tag">Second</a> <a href="/photo-tag/thirdandlast" rel="tag">Third and Last</a> ');
	});
	it('extracts numbers from strings', ()=> {
		expect(format.parseNumber('hey 34')).equals(34);
		expect(format.parseNumber('wow 28.9')).equals(28.9);
		expect(format.parseNumber('nothing')).to.be.NaN;
	});
	it('substitutes nicer typography', ()=> {
		expect(format.typography(u)).is.null;
		expect(format.typography('')).is.null;
		expect(format.typography('"He said," she said')).equals('&ldquo;He said,&rdquo; she said');
		expect(format.typography('<a href="/page">so you "say"</a>')).equals('<a href="/page">so you &ldquo;say&rdquo;</a>');
	});
	it('creates glyphicons', ()=> {
		expect(format.icon('star')).equals('<span class="glyphicon glyphicon-star"></span>');
	});
	it.skip('formats photo captions', ()=> {

	});
});