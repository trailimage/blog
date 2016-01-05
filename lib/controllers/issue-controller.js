'use strict';

const Blog = require('../');

exports.view = (req, res) => {
	res.redirect(Blog.httpStatus.permanentRedirect, 'http://issues.' + Blog.config.domain);
};