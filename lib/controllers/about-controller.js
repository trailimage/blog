'use strict';

const TI = require('../');
const config = TI.config;
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => {
	/** @type Blog.LinkData.Person */
	let ld = TI.LinkData.Factory.owner();

	res.sendView(key, {
		title: 'About ' + config.site.title,
		jsonLD: ld.serialize()
	});
};