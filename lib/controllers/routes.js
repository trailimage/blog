var setting = require('../settings.js');
var app = require('express');
var ar = app.Router();
var ac = require('./admin-controller.js');

ar.get('/', ac.home);
ar.post('/view/delete', ac.deleteView);
ar.post('/track/upload', ac.uploadTrack);
ar.post('/library/reload', ac.reloadLibrary);
ar.post('/photo-tag/reload', ac.reloadPhotoTags);

exports.about = require('./about-controller.js');
exports.admin = ar;
exports.authorize = require('./authorize-controller.js');
exports.issue = require('./issue-controller.js');
exports.map = require('./map-controller.js');
exports.menu = require('./menu-controller.js');
exports.pdf = require('./pdf-controller.js');
exports.photo = require('./photo-controller.js');
exports.post = require('./post-controller.js');
exports.rss = require('./rss-controller.js');
exports.search = require('./search-controller.js');
exports.sitemap = require('./sitemap-controller.js');
exports.tag = require('./tag-controller.js');