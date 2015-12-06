'use strict';

class MockRequest {
	constructor() {
		this.referer = null;
		this.params = {};
	}

	get(field) {
		return this[field];
	}
}

module.exports = MockRequest;
