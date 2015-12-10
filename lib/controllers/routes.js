'use strict';

const controller = require('./');
const app = require('express');
const adminRouter = app.Router();
const apiRouter = app.Router();
const ac = controller.admin;
const api = controller.api;

adminRouter.get('/', ac.home);
adminRouter.post('/view/delete', ac.deleteView);
adminRouter.post('/map/delete', ac.deleteMap);
adminRouter.post('/model/reload', ac.reloadModel);

apiRouter.get('/menu', api.menu);
apiRouter.get('/post', api.post);

exports.about = controller.about;
exports.admin = adminRouter;
exports.api = apiRouter;
exports.issue = controller.issue;
exports.map = controller.map;
exports.menu = controller.menu;
exports.pdf = controller.pdf;
exports.photo = controller.photo;
exports.post = controller.post;
exports.rss = controller.rss;
exports.search = controller.search;
exports.sitemap = controller.sitemap;
exports.tag = controller.tag;