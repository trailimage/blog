'use strict';

const Blog = require('../');
const app = require('express');
const r = app.Router();
const ac = Blog.Controller.admin;

r.get('/', ac.home);
r.post('/view/delete', ac.deleteView);
r.post('/map/delete', ac.deleteMap);
r.post('/model/reload', ac.reloadModel);

exports.admin = r;