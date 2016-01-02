'use strict';

const TI = require('./../index');
const FileBase = TI.Provider.File.Base;
const request = require('request');

/**
 * Retrieve GPS file for post
 * @extends {Blog.Provider.File.Base}
 * @extends {Blog.Auth.Options}
 */
class MockFile extends FileBase {
	constructor(options) {
		super();

	}

	/**
	 * @param {Blog.Post} post
	 * @param {function(String)|ServerResponse} callback Return GPX string
	 */
	loadGPX(post, callback) {

	}

	/**
	 * @param {String} url Google URL
	 * @param {Blog.Post} post
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
	/** @type {Blog.Auth.Options} */
	auth: new TI.Auth.Options(2)
};