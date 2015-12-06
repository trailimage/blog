'use strict';

const Enum = require('../lib/enum.js');
const is = require('../lib/is.js');

class MockResponse {
	constructor() {
		/** @type {Number} */
		this.httpStatus = Enum.httpStatus.ok;
		this.ended = false;
		/**
		 * Method to call when response is complete
		 * Can be assigned as test middleware next() method so that response.end() and middelware next() are both captured
		 * @type {function}
		 */
		this.testCallback = null;
		/**
		 * @type {Object.<String>}
		 */
		this.headers = {};
		/**
		 * @type {String|Buffer}
		 */
		this.content = null;

		this.rendered = {
			/** @type {String} */
			template: null,
			/** @type {Object} */
			options: null
		};

		this.redirected = {
			/** @type {Number} */
			status: null,
			/** @type {String} */
			url: null
		};
	}

	/**
	 * @param {Number} value
	 * @return {MockResponse}
	 */
	status(value) {
		this.httpStatus = value;
		return this;
	}

	/**
	 * Set status to 404
	 * @returns {MockResponse}
	 */
	notFound() { return this.status(Enum.httpStatus.notFound); }

	/**
	 * @param {String} key
	 * @param {String} value
	 * @return {MockResponse}
	 */
	setHeader(key, value) {
		this.headers[key] = value;
		return this;
	}

	/**
	 * @param {String|Buffer} value
	 * @return {MockResponse}
	 */
	write(value) {
		this.content = value;
		return this;
	}

	/**
	 * @param {Number} status
	 * @param {String} url
	 */
	redirect(status, url) {
		this.redirected.status = status;
		this.redirected.url = url;
	}

	/**
	 *
	 * @param {String} template
	 * @param {Object} options
	 * @param {function(Object, String)} callback
	 */
	render(template, options, callback) {
		this.rendered.template = template;
		this.rendered.options = options;

		callback(null, JSON.stringify(this.rendered));
	}

	end() {
		this.ended = true;
		if (is.callable(this.testCallback)) { this.testCallback(); }
	}
}

module.exports = MockResponse;