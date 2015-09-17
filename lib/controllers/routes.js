'use strict';

var setting = require('../settings.js');
var app = require('express');
var adminRouter = app.Router();
var apiRouter = app.Router();
var ac = require('./admin-controller.js');
var api = require('./api-controller.js');

adminRouter.get('/', ac.home);
adminRouter.post('/view/delete', ac.deleteView);
adminRouter.post('/track/upload', ac.uploadTrack);
adminRouter.post('/library/reload', ac.reloadLibrary);
adminRouter.post('/photo-tag/reload', ac.reloadPhotoTags);

apiRouter.get('/menu', api.menu);
apiRouter.get('/post', api.post);

exports.about = require('./about-controller.js');
exports.admin = adminRouter;
exports.api = apiRouter;
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