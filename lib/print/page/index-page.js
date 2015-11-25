'use strict';

const is = require('../../is.js');
const PrintPage = require('./print-page.js');

/**
 * @extends {PrintPage}
 */
class IndexPage extends PrintPage {
	/**
	 * @param {PrintSize} [size]
	 */
	constructor(size) {
		super(size);
		/**
		 * @type {Object.<Number[]>}
		 */
		this.map = {}
	}

	/**
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
	pages(word) {
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
}

module.exports = IndexPage;