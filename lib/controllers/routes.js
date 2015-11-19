'use strict';

const config = require('../config.js');
const app = require('express');
const adminRouter = app.Router();
const apiRouter = app.Router();
const ac = require('./admin-controller.js');
const api = require('./api-controller.js');
const auth = require('./authorize-controller.js');

adminRouter.get('/', ac.home);
adminRouter.post('/view/delete', ac.deleteView);
adminRouter.post('/model/reload', ac.reloadModel);

apiRouter.get('/menu', api.menu);
apiRouter.get('/post', api.post);

exports.about = require('./about-controller.js');
exports.admin = adminRouter;
exports.api = apiRouter;
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