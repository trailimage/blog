'use strict';

/**
 * @alias TI.Mock.Request
 */
class MockRequest {
	constructor() {
		this.referer = null;
		this.params = {};
		/**
		 * @type {Object.<String, String>}
		 */
		this.headers = {};

		this.connection = {
			remoteAddress: ''
		}
	}

	get(field) {
		return this[field];
	}

	/**
	 * Retrieve header value
	 * @param {String} name
	 * @returns {String}
	 */
	header(name) { return this.headers[name];	}
}

module.exports = MockRequest;
