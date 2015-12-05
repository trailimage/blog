'use strict';

const mocha = require('mocha');
const expect = require('chai').expect;
const Layout = require('../../lib/pdf/pdf-layout.js');
const style = {
	"settings": {
		"fonts": {
			"heading": "dist/fonts/heading.ttf",
			"serif": "dist/fonts/serif.ttf",
			"sanSerif": "dist/fonts/sanSerif.ttf"
		},
		"colors": {
			"black": [0, 0, 0],
			"white": [255, 255, 255]
		}
	},
	"rules": {
		"defaultText": {
			"font": "serif",
			"fontSize": 12,
			"color": "black"
		},
		"defaultPage": {
			"margin": 0,
			"width": 11,
			"height": 8.5
		},
		"coverPage": {
			"inherit": "defaultPage",
			"alignContent": "center"
		},
		"paragraphText": {
			"inherit": "defaultText",
			"font": "sanSerif",
			"fontSize": 15
		},
		"quoteText": {
			"inherit": "paragraphText",
			"fontSize": 10
		}
	}
};

describe('PDF Layout', ()=> {
	it('converts inches to standard PDF pixels', ()=> {
		expect(Layout.inchesToPixels(1)).equals(72);
		expect(Layout.inchesToPixels(8.5)).equals(612);
	});

	it('converts PDF pixels to inches', ()=> {
		expect(Layout.pixelsToInches(72)).equals(1);
		expect(Layout.pixelsToInches(612)).equals(8.5);
	});

	describe('Style', ()=> {
		let layout = new Layout(style);

		it('substitutes color aliases for actual colors', ()=> {
			expect(layout.rules.defaultText.color).equals(layout.settings.colors.black);
		});

		it('propagates styles rules through inheritance', ()=> {
			expect(layout.rules['paragraphText'].color).equals(layout.settings.colors.black);
			expect(layout.rules['quoteText'].color).equals(layout.settings.colors.black);
		});

		it('overrides inherited rules', ()=> {
			expect(layout.rules['paragraphText'].fontSize).equals(15);
		});
	});
});