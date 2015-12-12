'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const Group = TI.PDF.Element.Group;
const Image = TI.PDF.Element.Image;
const Text = TI.PDF.Element.Text;
const Size = TI.PhotoSize;
const style = {
	rules: {
		testGroup: {
			top: 0,
			left: 0,
			width: 20,
			height: 15,
			alignContent: TI.PDF.Align.Center
		},
		testImage: {
			scale: TI.PDF.Scale.Fit
		},
		testText: {
			left: 0,
			bottom: 0,
			right: 0
		},
		inner1: {
			top: 6,
			left: 5,
			width: 9,
			height: 7
		},
		inner2: {
			top: 4,
			left: 5,
			width: 4,
			height: 3
		}
	}
};

describe('PDF Element Group', ()=> {
	let layout = new TI.PDF.Layout(style);
	let group = new Group('testGroup');
	let img = new Image('testImage');
	let text = new Text('testText');

	img.original = new Size();
	//group.add(img);

	it('updates absolute offsets of child elements', ()=> {
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
		let inner1 = new Group('inner1');
		let inner2 = new Text('inner2');

		inner1.add(inner2);
		group.add(inner1);

		group.explicitLayout(layout);
		//group.implicitLayout();

		expect(inner1.offset.top).equals(6);
		expect(inner1.offset.left).equals(5);
		expect(inner2.offset.top).equals(10);
		//expect(inner2.absolute.left).equals(10);
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

		text.right = text.left = text.bottom = 0;

		// text height is normally calculated
		text.height = 2;

		//group.implicitLayout(area);

		//expect(img.width).equals(17 * (13/16));
		//expect(img.height).equals(13);
		//expect(img.top).equals(0);
		//expect(img.left).equals()
	});
});
