'use strict';

const is = require('../is.js');
const config = require('../config.js');
const OAuthBase = require('../auth/oauth-base.js');

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
		this.cache = require('../cache/model-cache.js');
	}
}

module.exports = VideoBase;