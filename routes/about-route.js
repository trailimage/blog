var Setting = require('../settings.js');
/** @type {singleton} */
var Output = require('../adapters/output.js');
/** @type {String} */
var key = 'about';
var log = require('winston');

/**
 * Default route action
 */
exports.view = function(req, res)
{
	Output.current.reply(key, res, 'About ' + Setting.title);
};

exports.clear = function(req, res)
{
	log.warn('Clearing about page from cache');
	Output.current.remove(key, function(done) { res.redirect('/' + key); });
};