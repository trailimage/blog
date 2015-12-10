'use strict';

class FactoryIndex {
	static get Base() { return require('./factory-base.js'); }
	static get Flickr() { return require('../providers/flickr/flickr-factory.js'); }
}

module.exports = FactoryIndex;
