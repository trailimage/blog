'use strict';

class MockRequest {
	constructor() {
		this.referer = null;
	}

	get(field) {
		return this[field];
	}
}

module.exports = MockRequest;
