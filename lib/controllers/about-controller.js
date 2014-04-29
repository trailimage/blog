var setting = require('../settings.js');
var key = 'about';

/**
 * Default route action
 */
exports.view = function(req, res)
{
	res.fromCache(key, { title: 'About ' + setting.title });
};