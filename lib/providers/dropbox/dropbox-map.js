'use strict';

const FileBase = require('../../map/map-base');
const extend = require('extend');
const log = require('../../config.js').provider.log;

/**
 * @extends {FileBase}
 */
class DropBoxFile extends FileBase {
	constructor(options) {
		super();

		/** @type {defaultDropBoxOptions} */
		this.options = extend(true, defaultDropBoxOptions, options);
	}
}

module.exports = DropBoxFile;

// - Private static members ---------------------------------------------------

const defaultDropBoxOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	clientID: null,
	oauth: {
		/** @type {String} */
		token: null,
		/** @type {String} */
		secret: null,
		/** @type {String} */
		accessToken: null,
		/** @type {String} */
		refreshToken: null,
		/**
		 * Callback URL for OAuth call
		 * @type {String}
		 */
		url: null
	}
};