'use strict';

class FactoryIndex {
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
}

module.exports = FactoryIndex;
