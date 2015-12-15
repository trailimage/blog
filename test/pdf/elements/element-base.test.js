'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const ElementBase = TI.PDF.Element.Base;
const Area = TI.PDF.Element.Area;

describe('PDF Element', ()=> {
	it('returns RGB and A values separately from set RGBA colors', ()=> {
		let el = new ElementBase();
		el.color = [10, 10, 10, 0.5];

		expect(el.color).deep.equals([10, 10, 10]);
		expect(el.opacity).equals(0.5);

		// setting color resets opacity
		el.color = [255, 255, 12];
		expect(el.opacity).equals(1);
	});

	it('scales width and height for anchored edges', ()=> {
		let el = new ElementBase();
		let container = new Area();

		/*         20
		┌──────┬───────────────┐
		│      5               │
		│   ╔══╧═════════╗     │
		├ 3 ╢        <7> ╟  5  ┤
		│   ║    <12>    ║     │ 20
		│   ╚═════════╤══╝     │
		│                      │
		│             8        │
		└─────────────┴────────┘
		<calculated>
		*/

		container.width = container.height = 20;
		container.top = container.left = 0;

		// no width or height set
		el.top = 5;
		el.bottom = 8;
		el.left = 3;
		el.right = 5;

		el.scale(container);

		expect(el.width).equals(12);
		expect(el.height).equals(7);

		// override explicit dimensions to fit area
		el.width = el.height = 50;
		el.scale(container);

		expect(el.width).equals(12);
		expect(el.height).equals(7);
	});

	it('calculates edge offset when size and opposite edge are known', ()=> {
		let el = new ElementBase();
		let container = new Area();

		/*         20
		┌──────┬───────────────┐
		│     <5>              │
		│   ╔══╧═════════╗     │
		├<3>╢          7 ╟  5  ┤
		│   ║     12     ║     │ 20
		│   ╚═════════╤══╝     │
		│             │        │
		│             8        │
		└─────────────┴────────┘
		<calculated>
		*/

		container.width = container.height = 20;
		container.top = container.left = 0;

		// no right or bottom set
		el.right = 5;
		el.bottom = 8;
		el.width = 12;
		el.height = 7;

		el.alignWithin(container);

		expect(el.top).equals(5);
		expect(el.left).equals(3);
	});

	it('calculates offsets based on alignment', ()=> {
		let el = new ElementBase();
		let container = new Area();

		/*         20
		┌──────┬───────────────┐
		│     <5>              │
		│    ╔═╧══════════╗    │
		├<4>─╢          7 ║    │
		│    ║     12     ║    │ 20
		│    ╚═════════╤══╝    │
		│              │       │
		│              8       │
		└──────────────┴───────┘
		<calculated>
		*/

		container.width = container.height = 20;
		container.top = container.left = 0;
		container.align.horizontal = TI.PDF.Align.Center;
		container.align.vertical = TI.PDF.Align.Center;

		// no right or bottom set
		el.bottom = 8;
		el.width = 12;
		el.height = 7;

		el.alignWithin(container);

		// vertical center rule should be overriden by explicit bottom
		expect(el.top).equals(5);
		expect(el.left).equals(4);
	});
});