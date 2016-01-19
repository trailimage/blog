'use strict';

const Blog = require('../lib');

Blog.active.log = new Blog.Provider.Log.Null();

module.exports = Blog;