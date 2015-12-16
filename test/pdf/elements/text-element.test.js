'use strict';

const TI = require('../../');
const mocha = require('mocha');
const expect = require('chai').expect;
const TextElement = TI.PDF.Element.Text;
const style = {
	settings: {
		fonts: { sanSerif: TI.fontFile }
	},
	rules: {
		defaultText: { font: "sanSerif", fontSize: 12 },
		defaultPage: { margin: 0, width: 11, height: 8.5 }
	}
};

describe('PDF Text Element', ()=> {
	let text = new TextElement(TI.lipsum);
	let layout = new TI.PDF.Layout(style);

	layout.createDocument('Test Title', 'Test Author');
	layout.applyTo(text);

	it('calculates width based on content', ()=> {
		expect(text.width).is.NaN;
		let firstWidth = text.calculateWidth(layout);

		expect(firstWidth).above(0);
		// should increase for larger font
		text.fontSize = 14;
		text.calculateWidth(layout);
		expect(text.width).above(firstWidth);
	});

	it('calculates height based on content and width', ()=> {
		text.width = 2;
		let firstHeight = text.calculateHeight(layout);

		expect(firstHeight).above(1);
		// should decrease with larger width
		text.width = 4;
		text.calculateHeight(layout);
		expect(text.height).below(firstHeight);
	});
});