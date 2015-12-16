'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const Area = TI.PDF.Element.Area;

describe('PDF Element Offset', ()=> {
	it('indicates if offset has no values', ()=> {
		/** @type {TI.PDF.Element.Area} */
		let a = new Area();
		expect(a.isEmpty).is.true;

		a.height = 10;
		expect(a.isEmpty).is.false;
	});

	it("adds another element's offsets to its own", ()=> {
		/** @type {TI.PDF.Element.Area} */
		let a1 = new Area();
		/** @type {TI.PDF.Element.Area} */
		let a2 = new Area();
		a1.top = 10;
		a1.left = 10;
		a2.top = 2;
		a2.left = 4;

		a1.add(a2);

		expect(a1.pageTop).equals(12);
		expect(a1.pageLeft).equals(14);

		// handles NaN
		a2.pageTop = a2.top = NaN;
		a1.add(a2);

		expect(a1.pageTop).equals(12);
	});

	it('creates a copy of itself', ()=> {
		/** @type {TI.PDF.Element.Area} */
		let a = new Area();
		a.top = 1;
		a.left = 2;
		a.width = 3;
		a.height = 4;
		a.align.horizontal = TI.PDF.Align.Center;

		let b = a.copy();

		expect(b.top).equals(1);
		expect(b.height).equals(4);
		expect(b.align.horizontal).equals(TI.PDF.Align.Center);
	});

	it('indicates if offset areas overlap', ()=> {
		/** @type {TI.PDF.Element.Area} */
		let a1 = new Area();
		/** @type {TI.PDF.Element.Area} */
		let a2 = new Area();
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
		a1.top = 0;
		a1.left = 0;
		a1.width = 10;
		a1.height = 10;

		a2.top = 10;
		a2.left = 10;
		a2.width = 10;
		a2.height = 10;

		expect(a1.overlaps(a2)).is.false;

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
		a2.top = 9;
		expect(a1.overlaps(a2)).is.false;

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
		a2.top = 6;
		a2.left = 5;
		expect(a1.overlaps(a2)).is.true;

		/*
		┌───────────┐
		│ area 1    │
		│           │ ┌─────┐
		│           │ │     │
		│           │ └─────┘
		└───────────┘
		*/
		a2.top = 4;
		a2.left = 11;
		a2.height = 4;
		a2.width = 5;
		expect(a1.overlaps(a2)).is.false;
	});
});