'use strict';

const TI = require('../');
const app = require('express');
const adminRouter = app.Router();
const apiRouter = app.Router();
const ac = TI.Controller.admin;
const api = TI.Controller.api;

adminRouter.get('/', ac.home);
adminRouter.post('/view/delete', ac.deleteView);
adminRouter.post('/map/delete', ac.deleteMap);
adminRouter.post('/model/reload', ac.reloadModel);

apiRouter.get('/menu', api.menu);
apiRouter.get('/post', api.post);

exports.about = TI.Controller.about;
exports.admin = adminRouter;
exports.api = apiRouter;
exports.issue = TI.Controller.issue;
exports.map = TI.Controller.map;
exports.menu = TI.Controller.menu;
exports.pdf = TI.Controller.pdf;
exports.photo = TI.Controller.photo;
exports.post = TI.Controller.post;
exports.rss = TI.Controller.rss;
exports.search = TI.Controller.search;
exports.sitemap = TI.Controller.sitemap;
exports.tag = TI.Controller.tag;