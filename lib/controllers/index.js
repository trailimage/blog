'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 */
class ControllerNamespace {
	static get about() { return require('./about-controller.js'); }
	static get admin() { return require('./admin-controller.js'); }
	static get api() { return require('./api-controller.js'); }
	static get authorize() { return require('./authorize-controller.js'); }
	static get issue() { return require('./issue-controller.js'); }
	static get map() { return require('./map-controller.js'); }
	static get menu() { return require('./menu-controller.js'); }
	static get pdf() { return require('./pdf-controller.js'); }
	static get photo() { return require('./photo-controller.js'); }
	static get post() { return require('./post-controller.js'); }
	static get rss() { return require('./rss-controller.js'); }
	static get search() { return require('./search-controller.js'); }
	static get sitemap() { return require('./sitemap-controller.js'); }
	static get tag() { return require('./tag-controller.js'); }
}

module.exports = ControllerNamespace;