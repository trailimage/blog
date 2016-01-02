'use strict';

const TI = require('../../');
const FileBase = TI.Provider.File.Base;
const extend = require('extend');

/**
 * @extends Blog.Provider.File.Base
 * @extends Blog.Auth.Base
 */
class DropBoxFile extends FileBase {
	constructor(options) {
		super();

		/** @type defaultDropBoxOptions */
		this.options = extend(true, defaultDropBoxOptions, options);
	}
}

module.exports = DropBoxFile;

// - Private static members ---------------------------------------------------

const defaultDropBoxOptions = {
	/** @type String */
	apiKey: null,
	/** @type String */
	clientID: null,
	oauth: {
		/** @type String */
		token: null,
		/** @type String */
		secret: null,
		/** @type String */
		accessToken: null,
		/** @type String */
		refreshToken: null,
		/**
		 * Callback URL for OAuth call
		 * @type String
		 */
		url: null
	}
};