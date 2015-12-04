'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const ElementArea = require('../../../lib/pdf/elements/element-area.js');

describe('PDF Element Area', ()=> {
	it('indicates if area has no values', ()=> {
		let a = new ElementArea();
		expect(a.isEmpty).is.true;

		a.height = 10;
		expect(a.isEmpty).is.false;
	});
	it('indicates if areas overlap', ()=> {
		let area1 = new ElementArea();
		let area2 = new ElementArea();

		/*
		┌───────────┐
		│ area 1    │
		│           │
		│           │
		│           │
		└───────────┼───────────┐
   	            │ area 2    │
		            │           │
		            │           │
		            │           │
		            └───────────┘
		*/
		area1.top = 0;
		area1.left = 0;
		area1.width = 10;
		area1.height = 10;

		area2.top = 10;
		area2.left = 10;
		area2.width = 10;
		area2.height = 10;

		expect(area1.overlaps(area2)).is.false;

		/*
		┌───────────┐
		│ area 1    │
		│           │
		│           │
		│           ├───────────┐
		└───────────┤ area 2    │
   	            │           │
		            │           │
		            │           │
		            └───────────┘
		*/
		area2.top = 9;
		expect(area1.overlaps(area2)).is.false;

		/*
		┌───────────┐
		│ area 1    │
		│           │
		│     ┌─────┼─────┐
		│     │     │     │
		└─────┼─────┘     │
   	      │           │
		      │           │
            └───────────┘
		*/
		area2.top = 6;
		area2.left = 5;
		expect(area1.overlaps(area2)).is.true;

		/*
		┌───────────┐
		│ area 1    │
		│           │ ┌─────┐
		│           │ │     │
		│           │ └─────┘
		└───────────┘
		*/
		area2.top = 4;
		area2.left = 11;
		area2.height = 4;
		area2.width = 5;
		expect(area1.overlaps(area2)).is.false;
	});
});