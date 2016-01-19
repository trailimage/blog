'use strict';

const Blog = require('../');
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => {
	/** @type Blog.LinkData.Person */
	let ld = Blog.LinkData.Factory.owner();

	res.sendView(key, {
		title: 'About ' + Blog.config.site.title,
		jsonLD: ld.serialize()
	});
};