'use strict';

const Schema = require('../');
const mocha = require('mocha');
const expect = require('chai').expect;

describe('Shape', ()=> {
	it('extends Schema.thing', ()=> {
		let shape = Schema.shape({ elevation: 500 });

		expect(shape.type).equals(Schema.Type.shape);
		expect(shape.elevation).equals(500);
	});
});