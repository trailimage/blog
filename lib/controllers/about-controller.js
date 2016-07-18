'use strict';

const { config, linkData } = require('../');
const key = 'about';

exports.view = (req, res) => {
	let ld = linkData.factory.owner();

	res.sendView(key, {
		title: 'About ' + config.site.title,
		jsonLD: ld.serialize()
	});
};