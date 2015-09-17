'use strict';

var setting = require('../settings.js');
var log = require('winston');
var key = 'api-v1-';

exports.menu = function(req, res) {
	res.sendJson(key + 'menu', function() {
		return {};
	});
};

exports.post = function(req, res) {
	res.sendJson(key + 'post', function() {
		return {};
	});
};