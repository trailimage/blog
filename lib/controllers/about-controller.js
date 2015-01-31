"use strict";

var setting = require('../settings.js');
var key = 'about';

/**
 * Default route action
 */
exports.view = function(req, res)
{
	res.sendView(key, { title: 'About ' + setting.title });
};