const Blog = require('../');
const GoogleProvider = require('@trailimage/google-provider');

module.exports = function() {
	let c = GoogleProvider.Config();

	c.apiKey = config.env('GOOGLE_DRIVE_KEY');
	c.tracksFolder = '0B0lgcM9JCuSbMWluNjE4LVJtZWM';
	c.httpProxy = config.proxy;

	c.auth.clientID = config.env('GOOGLE_CLIENT_ID');
	c.auth.clientSecret = config.env('GOOGLE_SECRET');
	c.auth.url.callback = `http://www.${config.domain}/auth/google`;
	c.auth.accessToken = process.env['GOOGLE_ACCESS_TOKEN'];
	c.auth.refreshToken = process.env['GOOGLE_REFRESH_TOKEN'];

	Blog.active.file = new GoogleProvider.File(c);
};