'use strict';

const Blog = require('../');
const FlickrProvider = require('@trailimage/flickr-provider');

module.exports = function() {
	const config = Blog.config;
	/** @type FlickrProvider.Config */
	let c = FlickrProvider.Config();

	c.userID = '60950751@N04';
	c.appID = '72157631007435048';
	c.featureSets.push({ id: '72157632729508554', title: 'Ruminations' });
	c.excludeSets.push('72157631638576162');
	c.httpProxy = config.proxy;

	c.auth.clientID = config.env('FLICKR_API_KEY');
	c.auth.clientSecret = config.env('FLICKR_SECRET');
	c.auth.url.callback = `http://www.${config.domain}/auth/flickr`;
	c.auth.accessToken = process.env['FLICKR_ACCESS_TOKEN'];
	c.auth.tokenSecret = process.env['FLICKR_TOKEN_SECRET'];

	Blog.active.photo = new FlickrProvider.Photo(c);
};