'use strict';

const config = require('../').config;
const key = 'about';

/**
 * Default route action
 */
exports.view = (req, res) => { res.sendView(key, { title: 'About ' + config.title }); };