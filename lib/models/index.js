'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace
 * @alias TI.Factory
 */
class FactoryNamespace {
	static get Base() { return require('./factory-base.js'); }
	static get Flickr() { return require('../providers/flickr/flickr-factory.js'); }
	static get Facebook() { return require('../providers/facebook/facebook-factory.js'); }
	static get Instagram() { return require('../providers/instagram/instagram-factory.js'); }
}

module.exports = FactoryNamespace;
