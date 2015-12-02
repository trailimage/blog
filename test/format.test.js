'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const format = require('../lib/format.js');
// http://www.lipsum.com/
const lipsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
let u;   // undefined

describe('Formatting', ()=> {
	it('display date as MMM d, YYYY', ()=> {
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
	it('truncates IPv6 to v4', ()=> {
		expect(format.IPv6('::1')).equals('127.0.0.1');
		expect(format.IPv6('192.12.15.3')).equals('192.12.15.3');
		expect(format.IPv6('::abf2:192.12.15.3')).equals('192.12.15.3');
	});
	it.skip('formats timestamp according to ISO 8601', ()=> {

	});
	it.skip('obfuscates characters as HTML entities', ()=> {

	});
	it.skip('converts timestamp to Date', ()=> {

	});

	// http://rot13.com/
	it('ROT-13 encodes text', ()=> {
		expect(format.rot13('Neque porro quisquam est qui dolorem ipsum')).equals('Ardhr cbeeb dhvfdhnz rfg dhv qbyberz vcfhz');
	});

	// https://www.base64encode.org/
	it('base 64 encodes text', ()=> {
		expect(format.encodeBase64('Neque porro quisquam est qui dolorem ipsum')).equals('TmVxdWUgcG9ycm8gcXVpc3F1YW0gZXN0IHF1aSBkb2xvcmVtIGlwc3Vt');
	});
	it('base 64 decodes text', ()=> {
		expect(format.decodeBase64('TmVxdWUgcG9ycm8gcXVpc3F1YW0gZXN0IHF1aSBkb2xvcmVtIGlwc3Vt')).equals('Neque porro quisquam est qui dolorem ipsum');
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

	it('fixes malformed links', ()=> {
		let source = '<a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20" rel="nofollow">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20</a>(4-2011%20Issue%202).pdf';
		let target = '<a href="http://www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20(4-2011%20Issue%202).pdf">www.motoidaho.com/sites/default/files/IAMC%20Newsletter%20(4-2011%20Issue%202).pdf</a>';

		expect(format.fixMalformedLink(source)).equals(target);

		source = '<a href="http://www.idahogeology.org/PDF/Technical_Reports_" rel="nofollow">www.idahogeology.org/PDF/Technical_Reports_</a>(T)/TR-81-1.pdf';
		target = '<a href="http://www.idahogeology.org/PDF/Technical_Reports_(T)/TR-81-1.pdf">www.idahogeology.org/PDF/Technical_Reports_(T)/TR-81-1.pdf</a>';

		expect(format.fixMalformedLink(source)).equals(target);
	});

	it('shortens link text to just the domain and page', ()=> {
		let source = '<a href="http://www.site.com/some/link-thing/that/goes/on">http://www.site.com/some/link-thing/that/goes/on</a>';
		let target = '<a href="http://www.site.com/some/link-thing/that/goes/on">site.com/&hellip;/on</a>';

		expect(format.shortenLinkText(source)).equals(target);

		source = '<a href="http://www.site.com/some/link-thing/that/goes/on">regular link text</a>';

		expect(format.shortenLinkText(source)).equals(source);
	});

	describe('Photo Captions', ()=> {
		/**
		 * Double-space
		 * @type {string}
		 */
		const ds = '\r\n\r\n';

		it('formats block quotes', ()=> {
			let source = lipsum + ds + '“' + lipsum + '”';
			let target = '<p>' + lipsum + '</p><blockquote><p>' + lipsum + '</p></blockquote>';

			expect(format.caption(source)).equals(target);

			source = lipsum + ds + '“' + lipsum + ds + '“' + lipsum + ds + '“' + lipsum + '”';
			target = '<p>' + lipsum + '</p><blockquote><p>' + lipsum + '</p><p>' + lipsum + '</p><p>' + lipsum + '</p></blockquote>';

			expect(format.caption(source)).equals(target);
		});

		it('styles superscripts', ()=> {
			let source = lipsum + '²';
			let target = '<p>' + lipsum + '<sup>²</sup></p>';
			expect(format.caption(source)).equals(target);
		});

		it.skip('styles quips');
	});
});