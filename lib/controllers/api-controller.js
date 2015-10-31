'use strict';

const config = require('../config.js');
const key = 'api-v1-';

exports.menu = (req, res) => { res.sendJson(key + 'menu', () => ({})); };

exports.post = (req, res) => { res.sendJson(key + 'post', () => ({})); };