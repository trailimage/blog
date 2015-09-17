'use strict';

var setting = require('../settings.js');
var key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => { res.sendView(key, { title: 'About ' + setting.title }); };