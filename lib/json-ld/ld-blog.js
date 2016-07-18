'use strict';

const { thing, Type } = require('./');

// http://schema.org/Blog
module.exports = thing.extend(Type.blog, {
	blogPost: null
});