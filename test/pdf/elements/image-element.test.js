'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Area = require('../../../lib/pdf/elements/element-area.js');
const Image = require('../../../lib/pdf/elements/image-element.js');
const Size = require('../../../lib/models/photo-size.js');
const Layout = require('../../../lib/pdf/pdf-layout.js');

describe('PDF Image Element', ()=> {
	it('detects if image is portrait or landscape orientation', ()=> {
		let img = new Image();
		img.original = new Size();
		img.original.width = 1024;
		img.original.height = 769;

		expect(img.isPortrait).is.false;

		img.original.height = 1025;

		expect(img.isPortrait).is.true;
	});
	it('scales original image to fit area', ()=> {
		let img = new Image();
		let area = new Area();
		img.original = new Size();

		/*         20
		╔═════╗───────────────┐            ╔══════════╗──────────┐
		║     ║               │            ║          ║          │
		║     ║ 10            │            ║          ║          │
		║     ║               │            ║          ║          │
		║     ║               │ 20   ►     ║          ║ 20       │
		╚═════╝               │            ║          ║          │
		│  5                  │            ║          ║          │
		│                     │            ║    10    ║          │
		└─────────────────────┘            ╚══════════╝──────────┘
		*/
		area.top = area.left = 0;
		area.width = area.height = 20;

		img.scaleTo = Layout.Scale.Fit;
		img.original.width = 5;
		img.original.height = 10;

		img.scale(area);

		expect(img.width).equals(10);
		expect(img.height).equals(20);

		/*         20
		┌─────────────────┬───┐            ┌──────────────────┬──┐
		│                 4   │            │                  4  │
		│             9   │   │            │             10   │  │
		│          ╔══════╧╗  │            │          ╔═══════╧══╗
		│        8 ║       ║  │ 20   ►     │      8.8 ║          ║
		├──── 5 ───╢       ║  │            │          ║          ║
		│          ╚═══════╝  │            ├──── 5 ───╢          ║
		│                     │            │          ╚══════════╝
		└─────────────────────┘            └─────────────────────┘
		*/

		img.top = 4;
		img.left = 5;
		img.original.width = 9;
		img.original.height = 8;

		img.scale(area);

		expect(img.width).equals(10);
		expect(img.height).equals(8 * (10/9));
		expect(img.top).equals(4);
		expect(img.left).equals(5);

		/*         20
		┌─────────────────┬───┐            ╔═════════════════════╗
		│                 ?   │            ║         20          ║
		│             9   │   │            ║                     ║
		│          ╔══════╧╗  │            ║                     ║
		│        8 ║       ║  │ 20   ►     ║ 17.8                ║
		├──── ? ───╢       ║  │            ║                     ║
		│          ╚═══════╝  │            ║                     ║
		│                     │            ╚═════════════════════╝
		└─────────────────────┘            └─────────────────────┘
		*/
		img.top = NaN;
		img.left = NaN;

		img.scale(area);

		expect(img.width).equals(20);
		expect(img.height).equals(8 * (20/9));
		expect(img.top).equals(0);
		expect(img.left).equals(0);

		/*         20
		┌─────────────────────┐            ╔═════════════════╗───┐
		│                     │            ║                 ║   │
		│             9       │            ║                 ║   │
		│         ╔═══════╗   │            ║                 ║   │
		│       8 ║       ║   │ 20   ►     ║                 ║   │
		│         ║       ╟ 5 ┤            ║                 ╟ 5 ┤
		│         ╚════╤══╝   │            ╚══════════════╤══╝   │
		│              6      │            │              6      │
		└──────────────┴──────┘            └──────────────┴──────┘
		*/
		img.top = NaN;
		img.left = NaN;
		img.bottom = 6;
		img.right = 5;

		img.scale(area);

		expect(img.width).equals(20);
		expect(img.height).equals(8 * (20/9));
		expect(img.top).equals(0);
		expect(img.left).equals(0);
		expect(img.bottom).equals(6);
		expect(img.right).equals(5);

	});
	it('scales original image to fill area', ()=> {
		/*
		┌─────────────────────────┐
		│                         │
		│   ╔═════════════════╗   │
		│   ║                 ║   │
		│   ║                 ║   │  ►
		│   ║ element         ║   │
		│   ╚═════════════════╝   │
		│ area                    │
		└─────────────────────────┘
		*/
		/*         20
		╔═════╗───────────────┐            ╔══════════╗──────────┐
		║     ║               │            ║          ║          │
		║     ║ 10            │            ║          ║          │
		║     ║               │            ║          ║          │
		║     ║               │ 20   ►     ║          ║ 20       │
		╚═════╝               │            ║          ║          │
		│  5                  │            ║          ║          │
		│                     │            ║    10    ║          │
		└─────────────────────┘            ╚══════════╝──────────┘
		*/



	});
});
