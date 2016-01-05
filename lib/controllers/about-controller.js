'use strict';

const Blog = require('../');
const config = Blog.config;
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => {
	/** @type Blog.LinkData.Person */
	let ld = Blog.LinkData.Factory.owner();

	res.sendView(key, {
		title: 'About ' + config.site.title,
		jsonLD: ld.serialize()
	});
};