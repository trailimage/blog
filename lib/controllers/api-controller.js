'use strict';

var setting = require('../settings.js');
var key = 'api-v1-';

exports.menu = (req, res) => { res.sendJson(key + 'menu', () => ({})) };

exports.post = (req, res) => { res.sendJson(key + 'post', () => ({})) };