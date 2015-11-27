'use strict';

const is = require('../is.js');
const style = require('../../pdf-style.json');
const extend = require('extend');
const PDFPage = require('./pages/pdf-page.js');

/**
 * Parse pdf-style.json
 */
class PDFStyle {
	/**
	 * Configure PDF and styles to match
	 * @param {PDFDocument} pdf
	 * @see http://pdfkit.org/docs/getting_started.html
	 */
	constructor(pdf) {
		// register fonts with document
		for (let f in style.settings.fonts) { pdf.registerFont(f, style.settings.fonts[f]); }

		// PDF settings override style
		let size = pdf.options.size;
		let orientation = pdf.options.layout;
		let rules = style.rules.defaultPage;

		if (rules === undefined) { rules = {}; }

		if (is.array(size)) {
			rules.width = size[0];
			rules.height = size[1];
		} else {
			let d1 = 0;
			let d2 = 0;

			switch (size) {
				case PDFPage.Size.Legal: d1 = 8.5; d2 = 14; break;
				case PDFPage.Size.Letter: d1 = 8.5; d2 = 11; break;
			}

			if (orientation == PDFPage.Layout.Portrait) {
				rules.width = d1;
				rules.height = d2;
			} else {
				rules.width = d2;
				rules.height = d1;
			}
		}

		// replace color aliases with RGB values (pdfkit handles font aliases)
		for (let name in style.rules) {
			let rule = inherit(style.rules[name]);
			expandColors(rule, 'color');
			expandColors(rule, 'backgroundColor');
			style.rules[name] = rule;
		}
		// apply PDF page dimensions to default page rules
		style.rules.defaultPage = rules;
	}

	/**
	 * Apply style to element
	 * @param {PDFElement|PDFPage|ElementGroup} el
	 */
	applyTo(el) {
		let rules = style.rules[el.style];

		if (rules !== undefined) {
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

// - Private static members ---------------------------------------------------

/**
 * @param {Object} rules
 */
function inherit(rules) {
	if (is.defined(rules,'inherit')) {
		rules = extend({}, inherit(style.rules[rules.inherit]), rules);
		delete rules['inherit'];
	}
	return rules;
}

/**
 * Replace color alias with color value
 * @param {Object<String>} rule Style rules
 * @param {String} fieldName Field with color alias
 */
function expandColors(rule, fieldName) {
	let color = rule[fieldName];

	if (color !== undefined && !is.array(color) && is.defined(style.settings.colors, color)) {
		// if color value matches an alias then replace with RGB array
		rule[fieldName] = style.settings.colors[color];
	}
}