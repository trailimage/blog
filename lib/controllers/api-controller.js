var setting = require('../settings.js');
var log = require('winston');
var key = 'api-v1-';

exports.menu = function(req, res)
{
	res.jsonCache(key + 'menu', function()
	{
		return {};
	});
};

exports.post = function(req, res)
{
	res.jsonCache(key + 'post', function()
	{
		return {};
	});
};