'use strict';

const is = require('../is.js');
const style = require('../../pdf-style.json');
const extend = require('extend');

/**
 * Parse pdf-style.json
 */
class PDFStyle {
	/**
	 * @param {PDFDocument} pdf
	 */
	constructor(pdf) {
		for (let f in style.settings.fonts) { pdf.registerFont(f, style.settings.fonts[f]); }
	}

	/**
	 * Apply style to element
	 * @param {PDFElement|PDFPage} el
	 */
	applyTo(el) {
		let rules = style.rules[el.style];

		if (rules !== undefined) {
			if (is.defined(rules,'inherit')) {
				rules = extend({}, rules, style.rules[rules.inherit]);
			}
			for (let r in rules) {
				switch (r) {
					case "margin": break; el.allMargins = rules[r]; break;
					case "marginBottom": el.margin.bottom = rules[r]; break;
					case "marginLeft": el.margin.left = rules[r]; break;
					case "marginRight": el.margin.right = rules[r]; break;
					case "marginTop": el.margin.top = rules[r]; break;
					case "scale": break;
					// rules that directly match element properties:
					case "alignContent":
					case "backgroundColor":
					case "bottom":
					case "color":
					case "font":
					case "fontSize":
					case "minWidth":
					case "top":
					case "width": el[r] = rules[r]; break;
				}
			}
		}
	}
}

module.exports = PDFStyle;