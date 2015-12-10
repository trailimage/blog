'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const ElementArea = TI.PDF.Element.Area;

describe('PDF Element Area', ()=> {
	it('indicates if area has no values', ()=> {
		let a = new ElementArea();
		expect(a.isEmpty).is.true;

		a.height = 10;
		expect(a.isEmpty).is.false;
	});

	it("adds another element's offsets to its own", ()=> {
		let a = new ElementArea();
		let b = new ElementArea();
		a.top = 10;
		a.left = 10;
		b.top = 2;
		b.left = 4;

		a.add(b);

		expect(a.top).equals(12);
		expect(a.left).equals(14);

		// handles NaN
		b.top = NaN;
		a.add(b);

		expect(a.top).equals(12);
	});

	it('creates a copy of itself', ()=> {
		let a = new ElementArea();
		a.top = 1;
		a.left = 2;
		a.width = 3;
		a.height = 4;

		let b = a.copy();

		expect(b.top).equals(1);
		expect(b.height).equals(4);
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