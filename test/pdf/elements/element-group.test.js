'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const Group = TI.PDF.Element.Group;
const Image = TI.PDF.Element.Image;
const Rectangle = TI.PDF.Element.Rectangle;
const Size = TI.PhotoSize;
const style = {
	rules: {
		testGroup: {
			top: 0,
			left: 0,
			width: 20,
			height: 15,
			alignContent: TI.PDF.Align.Center,
			verticalAlign: TI.PDF.Align.Middle
		},
		testImage: {
			scale: TI.PDF.Scale.Fit
		},
		testRect: {
			left: 0,
			bottom: 0,
			right: 0
		},
		inner1a: {
			top: 6,
			left: 5,
			width: 9,
			height: 7
		},
		inner2a: {
			top: 4,
			left: 5,
			width: 4,
			height: 3
		},
		inner1b: {
			width: 14,
			height: 8
		},
		inner2b: {
			width: 7,
			height: 5
		}
	}
};

describe('PDF Element Group', ()=> {
	let layout = new TI.PDF.Layout(style);
	let group = new Group('testGroup');
	let img = new Image('testImage');
	let rect = new Rectangle('testRect');

	img.original = new Size();

	it('updates offsets of explicitly positioned child elements', ()=> {
		/*
		            ← 20 →
		┌──────┬──────────────────┬───┐
		│      6 ───── 9 ─────┤   │   │
		│      ↓     ├─ 4 ─┤     10*  │
		├─ 5 → ╔══════════════╗ ┬ │ ┬ │ ↑
		│      ║ inner1       ║ 4 │ │ │ 15
		│      ╟─ 5 →┌─────┐  ║ ┼ ┴ │ │ ↓
		├──────╫ 10*→│  2  │  ║ 3   8 │
		│      ║     └─────┘  ║ ┴   │ │
		│      ╚══════════════╝     ┴ │
		└─────────────────────────────┘ * calculated
		*/
		let inner1 = new Group('inner1a');
		let inner2 = new Rectangle('inner2a');

		inner1.add(inner2);
		group.add(inner1);

		group.explicitLayout(layout);
		// style values
		expect(inner1.top).equals(6);
		expect(inner1.left).equals(5);
		// computed values
		expect(inner2.top).equals(10);
		expect(inner2.left).equals(10);
	});

	it('updates offsets of implicitly positioned child elements', ()=> {
		/*
		            ← 20 →
		┌─────────────────────────────┐ ↑   ↑
		│   ├──────── 14 ─────────┤   │3.5* 5*
		│   ╔═════════════════════╗   │ ┴   │
	  ↑│   ║ (1)┌───────────┐  ↑ ║   │     ┴
	 15│   ║    │(2)      5 │  8 ║   │
	  ↓│   ║    │         ↓ │  ↓ ║   │
		│   ║    └───────────┘    ║   │
		│   ╚═════════════════════╝   │
		│        ├──── 7 ────┤        │
		└─────────────────────────────┘ * calculated
       ←3*┤
       ← 6.5* ─┤
		*/
		let inner1 = new Group('inner1b');
		let inner2 = new Rectangle('inner2b');

		group.empty();
		inner1.add(inner2);
		group.add(inner1);

		group.explicitLayout(layout);
		group.implicitLayout();
		// style values
		expect(group.alignContent).equals(TI.PDF.Align.Center);
		expect(group.verticalAlign).equals(TI.PDF.Align.Middle);
		expect(inner1.width).equals(14);
		expect(inner1.height).equals(8);
		expect(inner2.width).equals(7);
		expect(inner2.height).equals(5);
		// computed values
		expect(inner1.top).equals(3.5);
		expect(inner1.left).equals(3);
		expect(inner2.top).equals(5);
		expect(inner2.left).equals(6.5);
	});

	it.skip('scales and centers child elements', ()=> {
		/*       ← 20 →
		 ╔══════════╗
		 ║ img      ║                       ← 6.25 ┤
		 ║──────────║──────────┐            ┌──────╔═══════╗──────┐
		 ║        ↑ ║    group │            │      ║ img   ║      │
		 ║       20 ║          │ ↑          │      ║       ║      │
		 ║        ↓ ║          │ 15   ►     │      ║       ║      │
		 ║          ║          │ ↓          │      ║       ║      │
		 ║  ← 10 →  ║          │            │      ║← 7.5 →║      │
		 ╚══════════╝──────────┘            └──────╚═══════╝──────┘
		 */
		img.original.width = TI.PDF.inchesToPixels(10);
		img.original.height = TI.PDF.inchesToPixels(20);

		group.explicitLayout(layout);
		group.implicitLayout();

		expect(img.width).equals(7.5);
		expect(img.height).equals(15);
		expect(img.top).equals(0);
		expect(img.left).equals(6.25);
	});

	it('adjusts scalable elements to fit or fill available space', ()=> {
		/*
		 ╔═══════════════════════════╗
		 ║ img                       ║
		 ║                           ║
		 ║                           ║                 ←3.1┤
		┌║──────────────────────── ↑ ║────┐            ┌───╔═════════════════════════╗───┐
		│║                        16 ║    │            │   ║                         ║   │
		│║                         ↓ ║    │            │   ║                         ║   │
		│║                           ║    │            │   ║                       ↑ ║   │
		│║           ← 17 →          ║    │ ↑          │   ║                      13 ║   │
		│╚═══════════════════════════╝    │ 15   ►     │   ║                       ↓ ║   │
		│╔════════════════════════════╗   │ ↓          │   ║                         ║   │
		│║ text                    2↕ ╟ 0 ┤            │   ║         ← 13.8 →        ║   │
		│╚══════════════════════════╤═╝   │            ╔═══╩═════════════════════════╩═══╗
		│ area                      0     │            ║ text                         2↕ ║
		└───────────────────────────┴─────┘            ╚═════════════════════════════════╝
		               ← 20 →                                         ← 20 →
		*/
		img.original.width = TI.PDF.inchesToPixels(17);
		img.original.height = TI.PDF.inchesToPixels(16);

		rect.right = rect.left = rect.bottom = 0;

		// text height is normally calculated
		rect.height = 2;

		//group.implicitLayout(area);

		//expect(img.width).equals(17 * (13/16));
		//expect(img.height).equals(13);
		//expect(img.top).equals(0);
		//expect(img.left).equals()
	});
});
