'use strict';

const { article } = require('./');

// http://schema.org/SocialMediaPosting
module.exports = article.extend('SocialMediaPosting', {
   // CreativeWork
	sharedContent: null
});