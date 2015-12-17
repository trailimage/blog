'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const Group = TI.PDF.Element.Group;
const Image = TI.PDF.Element.Image;
const TextElement = TI.PDF.Element.Text;
const Rectangle = TI.PDF.Element.Rectangle;
const Size = TI.PhotoSize;

describe('PDF Element Group', ()=> {
	let group = new Group('testGroup');
	let img = new Image('testImage');
	let rect = new Rectangle('testRect');

	img.original = new Size();

	it('updates offsets of explicitly positioned child elements', ()=> {
		/*
		            ← 20 →
		┌──────┬──────────────────┬───┐
		│      6 ───── 9 ─────┤   │   │
		│      ↓     ├─ 4 ─┤    <10>  │
		├─ 5 → ╔══════════════╗ ┬ │ ┬ │ ↑
		│      ║ inner1       ║ 4 │ │ │ 15
		│      ╟─ 5 →┌─────┐  ║ ┼ ┴ │ │ ↓
		├──────╫<10>→│  2  │  ║ 3   8 │
		│      ║     └─────┘  ║ ┴   │ │
		│      ╚══════════════╝     ┴ │
		└─────────────────────────────┘ <calculated>
		*/
		const style = {
			rules: {
				testGroup: { top: 0, left: 0, width: 20, height: 15 },
				inner1: { top: 6, left: 5, width: 9, height: 7 },
				inner2: { top: 4, left: 5, width: 4, height: 3 }
			}
		};
		let inner1 = new Group('inner1');
		let inner2 = new Rectangle('inner2');

		inner1.add(inner2);
		group.add(inner1);

		group.explicitLayout(new TI.PDF.Layout(style));
		// style values
		expect(inner1.top).equals(6);
		expect(inner1.left).equals(5);
		// computed values
		expect(inner2.pageTop).equals(10);
		expect(inner2.pageLeft).equals(10);
	});

	it('updates offsets of implicitly positioned child elements', ()=> {
		/*
		            ← 20 →
		┌─────────────────────────────┐  ↑    ↑
		│   ├──────── 14 ─────────┤   │<3.5> <5>
		│   ╔═════════════════════╗   │  ┴    │
	  ↑│   ║(1) ┌───────────┐  ↑ ║   │       ┴
	 15│   ║    │(2)      5 │  8 ║   │
	  ↓│   ║    │         ↓ │  ↓ ║   │
		│   ║    └───────────┘    ║   │
		│   ╚═════════════════════╝   │
		│        ├──── 7 ────┤        │
		└─────────────────────────────┘ <calculated>
       <3>┤
       <6.5>───┤
		*/
		const style = {
			rules: {
				testGroup: { top: 0, left: 0, width: 20, height: 15, align: TI.PDF.Align.Center, verticalAlign: TI.PDF.Align.Center },
				inner1: { width: 14, height: 8 },
				inner2: { width: 7, height: 5 }
			}
		};
		let inner1 = new Group('inner1');
		let inner2 = new Rectangle('inner2');

		group.empty();
		inner1.add(inner2);
		group.add(inner1);

		group.explicitLayout(new TI.PDF.Layout(style));
		group.implicitLayout();
		// style values
		expect(group.align.horizontal).equals(TI.PDF.Align.Center);
		expect(group.align.vertical).equals(TI.PDF.Align.Center);
		expect(inner1.width).equals(14);
		expect(inner1.height).equals(8);
		expect(inner2.width).equals(7);
		expect(inner2.height).equals(5);
		// computed values
		expect(inner1.align.horizontal).equals(TI.PDF.Align.Center);
		expect(inner1.align.vertical).equals(TI.PDF.Align.Center);
		expect(inner1.pageTop).equals(3.5);
		expect(inner1.pageLeft).equals(3);
		expect(inner2.pageTop).equals(5);
		expect(inner2.pageLeft).equals(6.5);
	});

	it('scales and centers child elements', ()=> {
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
		const style = {
			rules: {
				testGroup: { top: 0, left: 0, width: 20, height: 15, align: TI.PDF.Align.Center },
				testImage: { scale: TI.PDF.Scale.Fit }
			}
		};

		img.original.width = TI.PDF.inchesToPixels(10);
		img.original.height = TI.PDF.inchesToPixels(20);

		group.empty();
		group.add(img);
		group.explicitLayout(new TI.PDF.Layout(style));

		expect(img.width).equals(7.5);
		expect(img.height).equals(15);
		expect(img.top).equals(0);
		expect(img.left).equals(6.25);
	});

	it('positions text elements based on their computed size', ()=> {
		/*
		          ← 20 →
		┌───────────────────────┐       ┌───────────────────────┐
		│ group                 │       │ group                 │
		│     ╔═══════════╗     │       │                       │
		│     ║ text      ║     │   ►   │                       │
		│     ║           ║     │       │                       │
		│ ←1→ ║           ║ ←1→ │       │ ╔═══════════════════╗ │
		│     ╚═══════════╝     │       │1║ text              ║1│
		└───────────────────────┘       └─╚═══════════════════╝─┘
		*/
		const style = {
			settings: {	fonts: { sanSerif: TI.fontFile }	},
			rules: {
				defaultPage: { margin: 0, width: 11, height: 8.5 },
				defaultText: { left: 1, right: 1, font: "sanSerif", fontSize: 12 },
				testGroup: { top: 0, left: 0, width: 20, height: 15, verticalAlign: TI.PDF.Align.Bottom }
			}
		};
		let text = new TextElement(TI.lipsum);
		let layout = new TI.PDF.Layout(style);

		layout.createDocument('Test Title', 'Test Author');

		group.empty();
		group.add(text);

		expect(text.top).isNaN;
		expect(text.height).isNaN;

		group.explicitLayout(layout);

		expect(text.left).equals(1);
		expect(text.bottom).equals(0);
		expect(text.height).above(0.25);
		expect(text.top).equals(group.height - text.height);
	});

	it.skip('adjusts scalable elements to fit or fill available space', ()=> {
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
		const style = {
			rules: {
				testGroup: { top: 0, left: 0, width: 20, height: 15, align: TI.PDF.Align.Center },
				testImage: { width: 10, height: 20 },
				testRect: { width: 7, height: 5 }
			}
		};

		let img = new Image('testImage');
		let rect = new Rectangle('testRect');

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
