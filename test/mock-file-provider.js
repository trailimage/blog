'use strict';

const TI = require('./');
const FileBase = TI.Provider.File.Base;
const request = require('request');

/**
 * Retrieve GPS file for post
 * @extends {TI.Provider.File.Base}
 * @extends {TI.Auth.Options}
 */
class MockFile extends FileBase {
	constructor(options) {
		super();

	}

	/**
	 * @param {TI.Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX string
	 */
	loadGPX(post, callback) {

	}

	/**
	 * @param {String} url Google URL
	 * @param {TI.Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX to method or stream to response
	 * @private
	 */
	_downloadFile(url, post, callback) {

	}

	/**
	 * Refresh access token as needed
	 * @param {function(Boolean)} callback
	 * @private
	 */
	_verifyAuth(callback) {

	}

	/**
	 * Retrieve access and refresh tokens
	 * @param {String|Object} code
	 * @param {function(String, String, Date)} callback
	 */
	getAccessToken(code, callback) {

	};

	get authorizationURL() {

	}
}

module.exports = MockFile;

// - Private static members ---------------------------------------------------

const defaultMockOptions = {
	/** @type {String} */
	apiKey: null,
	/** @type {String} */
	tracksFolder: null,
	/** @type {TI.Auth.Options} */
	auth: new TI.Auth.Options(2)
};