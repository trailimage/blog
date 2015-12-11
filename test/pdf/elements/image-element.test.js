'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const Area = TI.PDF.Element.Area;
const Image = TI.PDF.Element.Image;

describe('PDF Image Element', ()=> {
	let img = new Image();
	let area = new Area();

	img.original = new TI.PhotoSize();
	img.scaleTo = TI.PDF.Scale.Fit;
	area.top = area.left = 0;
	area.width = 20;
	area.height = 15;

	it('detects if image is portrait or landscape orientation', ()=> {
		img.original.width = 1024;
		img.original.height = 769;

		expect(img.isPortrait).is.false;

		img.original.height = 1025;

		expect(img.isPortrait).is.true;
	});

	it('maintains aspect ratio while scaling down to fit area', ()=> {
		/*       ← 20 →
		╔══════════╗
		║ img      ║
		║──────────║──────────┐            ╔════════╗────────────┐
		║        ↑ ║     area │            ║        ║            │
		║       20 ║          │ ↑          ║      ↑ ║            │
		║        ↓ ║          │ 15   ►     ║     15 ║            │
		║          ║          │ ↓          ║      ↓ ║            │
		║  ← 10 →  ║          │            ║← 7.5 → ║            │
		╚══════════╝──────────┘            ╚════════╝────────────┘
		*/
		img.original.width = TI.PDF.inchesToPixels(10);
		img.original.height = TI.PDF.inchesToPixels(20);

		img.scale(area);

		expect(img.width).equals(7.5);
		expect(img.height).equals(15);

		// image that already fits shouldn't be scaled
		img.original.width = TI.PDF.inchesToPixels(4);
		img.original.height = TI.PDF.inchesToPixels(2);

		img.scale(area);

		expect(img.width).equals(4);
		expect(img.height).equals(2);
	});

	it('scales image up to fill area', ()=> {
		/*                                 ╔═════════════════════╗
		         ← 20 →                    ║ img                 ║
		╔══════════╗                       ║       ← 20 →        ║ ↑
		║ img      ║                       ║                     ║ 12.5
		║──────────║──────────┐            ║─────────────────────║ ┴
		║        ↑ ║     area │            ║               area  ║
		║       20 ║          │ ↑        ↑ ║                     ║
		║        ↓ ║          │ 15   ►  40 ║                     ║
		║          ║          │ ↓        ↓ ║                     ║
		║  ← 10 →  ║          │            ║                     ║
		╚══════════╝──────────┘            ║─────────────────────║ ┬
		                                   ║                     ║ 12.5
		                                   ║                     ║ ↓
		                                   ║                     ║
		                                   ╚═════════════════════╝
		*/
		img.original.width = TI.PDF.inchesToPixels(10);
		img.original.height = TI.PDF.inchesToPixels(20);

		img.scaleTo = TI.PDF.Scale.Fill;
		img.scale(area);

		expect(img.width).equals(20);
		expect(img.height).equals(40);
		expect(img.top).equals(-12.5);
	});

	it.skip('maintains aspect ratio while scaling up to fit area');
	/*       ← 20 →
	╔═════╗───────────────┐            ╔══════════╗──────────┐
	║ img ║ ↑        area │            ║          ║          │
	║     ║ 10            │            ║          ║          │
	║     ║ ↓             │ ↑          ║          ║          │
	║     ║               │ 20   ►     ║          ║ 20       │
	╚═════╝               │ ↓          ║          ║          │
	│← 5 →                │            ║          ║          │
	│                     │            ║    10    ║          │
	└─────────────────────┘            ╚══════════╝──────────┘
	*/
		//img.original.width = Layout.inchesToPixels(5);
		//img.original.height = Layout.inchesToPixels(10);
		//
		//img.scale(area);

		//expect(img.width).equals(10);
		//expect(img.height).equals(20);

	it.skip('scales image up without moving it if its position is defined');
		/*         20
		┌─────────────────┬───┐            ┌──────────────────┬──┐
		│                 4   │            │                  4  │
		│                 ↓   │            │                  ↓  │
		│        ┬ ╔═══════╗  │            │       ┬  ╔══════════╗
		│        8 ║       ║  │ 20   ►     │      8.8 ║          ║
		│        ↓ ║       ║  │            │       ↓  ║  ← 10 →  ║
		├───── 5 → ╚═══════╝  │            ├───── 5 → ║          ║
		│            ← 9 →    │            │          ╚══════════╝
		└─────────────────────┘            └─────────────────────┘
		*/
		//img.top = 4;
		//img.left = 5;
		//img.original.width = Layout.inchesToPixels(9);
		//img.original.height = Layout.inchesToPixels(8);
		//
		//img.scale(area);
		//
		//expect(img.width).equals(10);
		//expect(img.height).equals(8 * (10/9));
		//expect(img.top).equals(4);
		//expect(img.left).equals(5);

	it.skip('scales up and repositions image if its position is not set');
		/*         20
		┌─────────────────┬───┐            ╔═════════════════════╗
		│                 ?   │            ║         20          ║
		│             9   ↓   │            ║                     ║
		│          ╔═══════╗  │            ║                     ║
		│        8 ║       ║  │ 20   ►     ║ 17.8                ║
		│          ║       ║  │            ║                     ║
		├───── ? → ╚═══════╝  │            ║                     ║
		│                     │            ╚═════════════════════╝
		└─────────────────────┘            └─────────────────────┘
		*/
		//img.top = NaN;
		//img.left = NaN;
		//
		//img.scale(area);
		//
		//expect(img.width).equals(20);
		//expect(img.height).equals(8 * (20/9));
		//expect(img.top).equals(0);
		//expect(img.left).equals(0);

	it.skip('maintains image offsets from area container while scaling up');
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
		//img.top = NaN;
		//img.left = NaN;
		//img.bottom = 6;
		//img.right = 5;
		//
		//img.scale(area);
		//
		//expect(img.width).equals(20);
		//expect(img.height).equals(8 * (20/9));
		//expect(img.top).equals(0);
		//expect(img.left).equals(0);
		//expect(img.bottom).equals(6);
		//expect(img.right).equals(5);
});
