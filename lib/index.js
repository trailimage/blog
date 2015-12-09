'use strict';

/** @type {ProviderManager} */
let _provider = null;

class Application {
	static get is() { return require('./is.js'); }
	static get enum() { return require('./enum.js'); }
	static get re() { return require('./regex.js'); }
	static get template() { return require('./template.js'); }
	static get format() { return require('./format.js'); }
	static get config() { return require('./config.js'); }
	static get provider() {
		if (_provider === null) {
			const ProviderManager = require('./providers/manager.js');
			_provider = new ProviderManager();
		}
		return _provider;
	}
}

module.exports = Application;