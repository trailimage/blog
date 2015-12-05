'use strict';

const Enum = require('../lib/enum.js');

class MockResponse {
	constructor() {
		this.httpStatus = Enum.httpStatus.ok;
		this.ended = false;
	}

	/**
	 * @param {String} value
	 */
	status(value) { this.httpStatus = value; }
	end() { this.ended = true; }
}

module.exports = MockResponse;