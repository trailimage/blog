'use strict';

const TI = require('../');
const config = TI.config;
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => {
	/** @type TI.LinkData.Person */
	let ld = TI.LinkData.Factory.owner();

	res.sendView(key, {
		title: 'About ' + config.title,
		jsonLD: ld.serialize()
	});
};