'use strict';

const TI = require('../../');
const FileBase = TI.Provider.File.Base;
const extend = require('extend');

/**
 * @extends {FileBase}
 */
class GitHubFile extends FileBase {
	constructor(options) {
		super();

		/** @type {defaultGitHubOptions} */
		this.options = extend(true, defaultGitHubOptions, options);
	}
}

module.exports = GitHubFile;

// - Private static members ---------------------------------------------------

const defaultGitHubOptions = {
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