'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace TI.Controller
 */
class ControllerNamespace {
	/** @namespace TI.Controller.about */
	static get about() { return require('./about-controller.js'); }
	/** @namespace TI.Controller.admin */
	static get admin() { return require('./admin-controller.js'); }
	/** @namespace TI.Controller.api */
	static get api() { return require('./api-controller.js'); }
	/** @namespace TI.Controller.authorize */
	static get authorize() { return require('./authorize-controller.js'); }
	/** @namespace TI.Controller.issue */
	static get issue() { return require('./issue-controller.js'); }
	/** @namespace TI.Controller.map */
	static get map() { return require('./map-controller.js'); }
	/** @namespace TI.Controller.menu */
	static get menu() { return require('./menu-controller.js'); }
	/** @namespace TI.Controller.pdf */
	static get pdf() { return require('./pdf-controller.js'); }
	/** @namespace TI.Controller.photo */
	static get photo() { return require('./photo-controller.js'); }
	/** @namespace TI.Controller.post */
	static get post() { return require('./post-controller.js'); }
	/** @namespace TI.Controller.rss */
	static get rss() { return require('./rss-controller.js'); }
	/** @namespace TI.Controller.search */
	static get search() { return require('./search-controller.js'); }
	/** @namespace TI.Controller.sitemap */
	static get sitemap() { return require('./sitemap-controller.js'); }
	/** @namespace TI.Controller.tag */
	static get tag() { return require('./tag-controller.js'); }
}

module.exports = ControllerNamespace;