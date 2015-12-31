'use strict';

const TI = require('../');
const OAuthBase = TI.Auth.Base;

/**
 * Methods for interacting with video source
 * @extends TI.Auth.Base
 */
class VideoProviderBase extends OAuthBase {
	/**
	 * @param {FactoryBase} factory
	 */
	constructor(factory) {
		super();

		this.options = {};
		this.needsAuth = false;
		/**
		 * @type FactoryBase
		 */
		this.factory = factory;
		/**
		 * Methods for managing model cache
		 */
		this.cache = TI.Provider.Cache.Model;
	}
}

module.exports = VideoProviderBase;