var setting = require('../settings.js');
var Express = require('express');
var ar = Express.Router();
var ac = require('./admin-controller.js');

ar.get('/', ac.home);
ar.get('/issue/save', ac.saveIssue);
ar.get('/issue/delete', ac.deleteIssue);
ar.post('/view/delete', ac.deleteView);
ar.post('/track/upload', ac.uploadTrack);
ar.post('/library/reload', ac.reloadLibrary);
ar.post('/photo-tag/reload', ac.reloadPhotoTags);

exports.post = require('./post-controller.js');
exports.tag = require('./tag-controller.js');
exports.rss = require('./rss-controller.js');
exports.about = require('./about-controller.js');
exports.menu = require('./menu-controller.js');
exports.sitemap = require('./sitemap-controller.js');
exports.pdf = require('./pdf-controller.js');
exports.authorize = require('./authorize-controller.js');
exports.photo = require('./photo-controller.js');
exports.issue = require('./issue-controller.js');
exports.admin = ar;
exports.map = require('./map-controller.js');