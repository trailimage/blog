'use strict';

const TI = require('../');

/**
 * Methods for interacting with video source
 * @namespace TI.Provider.Video.Base
 * @extends {TI.Auth.Base}
 */
class VideoBase extends TI.Auth.Base {
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