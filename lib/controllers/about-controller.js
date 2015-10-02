'use strict';

const setting = require('../settings.js');
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => { res.sendView(key, { title: 'About ' + setting.title }); };