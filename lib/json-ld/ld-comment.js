'use strict';

const { creativeWork } = require('./');

// http://schema.org/Comment
module.exports = creativeWork.extend('Comment', {
	downvoteCount: 0,
	upvoteCount: 0
});