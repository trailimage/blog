'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Element = require('../../../lib/pdf/elements/pdf-element.js');
const Area = require('../../../lib/pdf/elements/element-area.js');

describe('PDF Element', ()=> {
	it('returns RGB and A values separately from set RGBA colors', ()=> {
		let el = new Element();
		el.color = [10, 10, 10, 0.5];

		expect(el.color).deep.equals([10, 10, 10]);
		expect(el.opacity).equals(0.5);

		// setting color resets opacity
		el.color = [255, 255, 12];
		expect(el.opacity).equals(1);
	});

	it('scales width and height for anchored edges', ()=> {
		let el = new Element();
		let area = new Area();

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

		area.width = area.height = 20;
		area.top = area.left = 0;

		// no width or height set
		el.top = 5;
		el.bottom = 8;
		el.left = 3;
		el.right = 5;

		el.scale(area);

		expect(el.width).equals(12);
		expect(el.height).equals(7);

		// override explicit dimensions to fit area
		el.width = el.height = 50;
		el.scale(area);

		expect(el.width).equals(12);
		expect(el.height).equals(7);
	});

	it('calculates edge offset when size and opposite edge are known', ()=> {
		let el = new Element();
		let area = new Area();

		/*         20
		┌──────┬───────────────┐
		│      5               │
		│   ╔══╧═════════╗     │
		├ 3 ╢          7 ╟ <5> ┤
		│   ║     12     ║     │ 20
		│   ╚═════════╤══╝     │
		│                      │
		│            <8>       │
		└─────────────┴────────┘
		<calculated>
		*/

		area.width = area.height = 20;
		area.top = area.left = 0;

		// no right or bottom set
		el.top = 5;
		el.left = 3;
		el.width = 12;
		el.height = 5;

		el.positionWithin(area);

		expect(el.right).equals(5);
		expect(el.bottom).equals(8);
	});
});