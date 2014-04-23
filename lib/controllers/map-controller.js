var setting = require('../settings.js');
var format = require('../format.js');
var Enum = require('../enum.js');
var map = require('../models/map.js');
var library = require('../models/library.js');
var Post = require('../models/post.js');
var log = require('winston');

exports.view = function(req, res)
{
	res.render('map',
	{
		'layout': 'layouts/empty',
		'title': 'Map',
		'post': library.postWithSlug(req.params.slug),
		'setting': setting
	});
};

exports.json = function(req, res)
{
	map.loadGPX(req.params.slug, function(item)
	{
		res.sendCompressed('application/json', new Buffer(item.buffer, 'hex'), item.eTag);
	});
};