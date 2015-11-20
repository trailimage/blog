'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const re = require('../lib/regex.js');
let u;   // undefined

describe('Patterns', ()=> {
	it('matches quote characters', ()=> {
		expect('"say"“'.replace(re.quote.any, '')).equals('say');

	});
});