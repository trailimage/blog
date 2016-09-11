'use strict';

const app = require('express');
const r = app.Router();
const c = require('./controller');

r.get('/', c.admin.home);
r.post('/view/delete', c.cache.deleteView);
r.post('/map/delete', c.cache.deleteMap);
r.post('/model/reload', c.reloadModel);

exports.admin = r;