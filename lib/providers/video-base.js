'use strict';

const TI = require('../');
const is = TI.is;
const config = TI.config;
const OAuthBase = TI.Auth.Base;

/**
 * Methods for interacting with video source
 * @extends {OAuthBase}
 */
class VideoBase extends OAuthBase {
	/**
	 * @param {FactoryBase} factory
	 */
	constructor(factory) {
		super();

		this.options = {};
		this.needsAuth = false;
		/**
		 * @type {FactoryBase}
		 */
		this.factory = factory;
		/**
		 * Methods for managing model cache
		 */
		this.cache = TI.Provider.Cache.Model;
	}
}

module.exports = VideoBase;