'use strict';

class AuthIndex {
	static get Base() { return require('./oauth-base.js'); }
	static get Helper() { return require('./oauth-helper.js'); }
	static get Options() { return require('./oauth-options.js'); }
}

module.exports = AuthIndex;