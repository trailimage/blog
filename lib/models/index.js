'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace
 * @name FactoryNamespace
 * @property {FactoryBase} Base
 * @property {FlickrFactory} Flickr
 * @property {FacebookFactory} Facebook
 * @property {InstagramFactory} Instagram
 */
class FactoryNamespace {
	/**
	 * @returns {FactoryBase}
	 * @constructor
	 */
	static get Base() { return require('./factory-base.js'); }

	/**
	 * @returns {FlickrFactory}
	 * @extends {FactoryBase}
	 * @constructor
	 */
	static get Flickr() { return require('../providers/flickr/flickr-factory.js'); }

	/**
	 * @returns {FacebookFactory}
	 * @constructor
	 */
	static get Facebook() { return require('../providers/facebook/facebook-factory.js'); }

	/**
	 * @returns {InstagramFactory}
	 * @constructor
	 */
	static get Instagram() { return require('../providers/instagram/instagram-factory.js'); }
}

module.exports = FactoryNamespace;
