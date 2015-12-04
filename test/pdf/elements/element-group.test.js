'use strict';

const pdfPath = '../../../lib/pdf/';
const mocha = require('mocha');
const expect = require('chai').expect;
const Group = require(pdfPath + 'elements/element-group.js');
const Area = require(pdfPath + 'elements/element-area.js');
const Image = require(pdfPath + 'elements/image-element.js');
const Text = require(pdfPath + 'elements/text-element.js');
const Size = require('../../../lib/models/photo-size.js');
const Layout = require(pdfPath + 'pdf-layout.js');

describe('PDF Element Group', ()=> {
	let group = new Group();
	let img = new Image();
	let text = new Text();
	let area = new Area();

	img.original = new Size();
	img.scaleTo = Layout.Scale.Fit;
	area.top = area.left = 0;
	area.width = 20;
	area.height = 15;

	it('adjusts layouts', ()=> {
		/*
		 ╔═══════════════════════════╗
		 ║ img                       ║
		 ║                           ║
		 ║                           ║
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
		//img.original.width = Layout.inchesToPixels(10);
		//img.original.height = Layout.inchesToPixels(20);
		//
		//img.scale(area);
		//
		//expect(img.width).equals(7.5);
		//expect(img.height).equals(15);
		//
		//// image that already fits shouldn't be scaled
		//img.original.width = Layout.inchesToPixels(4);
		//img.original.height = Layout.inchesToPixels(2);
		//
		//img.scale(area);
		//
		//expect(img.width).equals(4);
		//expect(img.height).equals(2);
	});
});
