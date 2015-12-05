'use strict';

const Enum = require('../lib/enum.js');
const is = require('../lib/is.js');

class MockResponse {
	constructor() {
		/** @type {Number} */
		this.httpStatus = Enum.httpStatus.ok;
		this.ended = false;
		/**
		 * Method to be called as both next() in middleware and in the event of ending the response
		 * otherwise the test will timeout if the resonse is ended
		 * @type {function}
		 */
		this.testCallback = null;
	}

	/**
	 * @param {Number} value
	 * @return {MockResponse}
	 */
	status(value) { this.httpStatus = value; return this; }

	end() {
		this.ended = true;
		if (is.callable(this.testCallback)) { this.testCallback(); }
	}
}

module.exports = MockResponse;