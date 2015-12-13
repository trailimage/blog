'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace
 * @alias TI.Controller
 */
class ControllerNamespace {
	/** @alias TI.Controller.about */
	static get about() { return require('./about-controller.js'); }
	/** @alias TI.Controller.admin */
	static get admin() { return require('./admin-controller.js'); }
	/** @alias TI.Controller.api */
	static get api() { return require('./api-controller.js'); }
	/** @alias TI.Controller.authorize */
	static get authorize() { return require('./authorize-controller.js'); }
	/** @alias TI.Controller.issue */
	static get issue() { return require('./issue-controller.js'); }
	/** @alias TI.Controller.map */
	static get map() { return require('./map-controller.js'); }
	/** @alias TI.Controller.menu */
	static get menu() { return require('./menu-controller.js'); }
	/** @alias TI.Controller.pdf */
	static get pdf() { return require('./pdf-controller.js'); }
	/** @alias TI.Controller.photo */
	static get photo() { return require('./photo-controller.js'); }
	/** @alias TI.Controller.post */
	static get post() { return require('./post-controller.js'); }
	/** @alias TI.Controller.rss */
	static get rss() { return require('./rss-controller.js'); }
	/** @alias TI.Controller.search */
	static get search() { return require('./search-controller.js'); }
	/** @alias TI.Controller.sitemap */
	static get sitemap() { return require('./sitemap-controller.js'); }
	/** @alias TI.Controller.tag */
	static get tag() { return require('./tag-controller.js'); }
}

module.exports = ControllerNamespace;