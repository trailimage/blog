'use strict';

const is = require('../../is.js');
const BasePage = require('./pdf-page.js');
const Font = require('../elements/text-element.js').Font;

/**
 * Page showing index of photo tags
 * @extends {BasePage}
 */
class IndexPage extends BasePage {
	constructor() {
		super();
		/**
		 * @type {Object.<Number[]>}
		 */
		this.map = {};
		/**
		 * Default style rule to use in pdf-style.json
		 * @type {String}
		 */
		this.style = 'indexPage';
	}

	/**
	 * Index words sorted alphabetically
	 * @return {String[]}
	 */
	get words() {
		let list = Object.keys(this.map);
		list.sort();
		return list;
	}

	/**
	 * Pages on which the word occurs
	 * @param {String} word
	 * @returns {Number[]}
	 */
	pageNumbers(word) {
		let list = this.map[word];
		list.sort();
		return list;
	}

	/**
	 * @param {String|String[]} word
	 * @param {Number} pageNumber
	 */
	addWord(word, pageNumber) {
		if (is.array(word)) {
			for (let w of word) { this._addWord(w, pageNumber); }
		} else {
			this._addWord(word, pageNumber);
		}
	}

	/**
	 * Add single word
	 * @param w
	 * @param n
	 * @private
	 */
	_addWord(w, n) {
		if (this.map.hasOwnProperty(w)) {
			this.map[w].push(n);
		} else {
			this.map[w] = [n];
		}
	}

	/**
	 * @param {PdfStyle} style
	 * @param {PDFDocument} pdf
	 * @param {function} callback
	 */
	render(style, pdf, callback) {
		pdf
			.addPage()
			.font(Font.SanSerif).fontSize(20).text('Index and About')
			.moveDown()
			.font(Font.Serif).fontSize(12);

		for (let w of this.words) {
			pdf.text(w + ' ..... ' + this.pageNumbers(w).join(', '));
		}

		callback();
	}
}

module.exports = IndexPage;