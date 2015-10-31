'use strict';

const config = require('../config.js');
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => { res.sendView(key, { title: 'About ' + config.title }); };