'use strict';

const { thing } = require('./');

// http://schema.org/ItemList
module.exports = thing.extend('ItemList', {
	numberOfItems: 0,
	itemListElement: null,
	itemListOrder: null,

	add(i) {
      if (this.itemListElement === null) { this.itemListElement = []; }
		this.itemListElement.push(i);
   }
});