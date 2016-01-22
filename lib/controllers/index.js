'use strict';

/**
 * Use getters to delay module initialization and avoid circular dependencies
 * @namespace
 * @alias Blog.Controller
 */
class ControllerNamespace {
	static get about() { return require('./about-controller.js'); }
	static get admin() { return require('./admin-controller.js'); }
	static get api() { return require('./api-controller.js'); }
	static get authorize() { return require('./authorize-controller.js'); }
	static get issue() { return require('./issue-controller.js'); }
	static get map() { return require('./map-controller.js'); }
	static get menu() { return require('./menu-controller.js'); }
	static get pdf() { return require('./pdf-controller.js'); }
	static get photo() { return require('./photo-controller.js'); }
	static get post() { return require('./post-controller.js'); }
	static get rss() { return require('./rss-controller.js'); }
	static get search() { return require('./search-controller.js'); }
	static get sitemap() { return require('./sitemap-controller.js'); }
	static get tag() { return require('./tag-controller.js'); }
}

/**
 * @param app
 * @param {Blog.Library} library
 * @param {Object} config
 * @see http://expressjs.com/4x/api.html#router
 * @see http://expressjs.com/guide/routing.html
 */
ControllerNamespace.defaultRoutes = function(app, library, config, httpStatus) {
	const c = ControllerNamespace;
	const r = require('./routes.js');
	// Slug pattern
	const s = '([\\w\\d-]{4,})';
	// Flickr photo ID pattern
	const photoID = ':photoID(\\d{10,11})';
	// Flickr set ID pattern
	const postID = ':postID(\\d{17})';
	//
	const rootPostTag = rootTagRoutePattern(library);

	app.use('/admin', r.admin);
	//app.use('/api/v1', r.api);
	//app.use('/auth', r.auth);

	for (let slug in config.redirects) {
		app.get('/' + slug, (req, res) => { res.redirect(httpStatus.permanentRedirect, '/' + config.redirects[slug]); });
	}

	// the latest posts
	app.get('/', c.tag.home);
	app.get('/rss', c.rss.view);
	app.get('/about', c.about.view);
	app.get('/js/post-menu-data.js', c.menu.data);
	app.get('/sitemap.xml', c.sitemap.view);
	app.get('/exif/'+photoID, c.photo.exif);
	app.get('/issues?', c.issue.view);
	app.get('/issues?/:slug'+s, c.issue.view);
	app.get('/tag-menu', c.tag.menu);
	app.get('/mobile-menu', c.menu.mobile);
	app.get('/search', c.search.view);
	app.get('/'+rootPostTag, c.tag.root);
	app.get('/'+rootPostTag+'/:tag', c.tag.view);
	// old blog links with format /YYYY/MM/slug
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', c.post.blog);
	app.get('/photo-tag', c.photo.tags);
	app.get('/photo-tag/:tagSlug', c.photo.tags);
	app.get('/photo-tag/search/:tagSlug', c.photo.withTag);
	// links with bare photo provider ID
	app.get('/'+photoID, c.photo.view);
	// links with bare photo provider set ID
	app.get('/'+postID, c.post.providerID);
	app.get('/'+postID+'/'+photoID, c.post.providerID);
	app.get('/:slug'+s+'/pdf', c.pdf.view);
	app.get('/:slug'+s+'/map', c.map.view);
	app.get('/:slug'+s+'/gpx', c.map.download);
	app.get('/:slug'+s+'/map/'+photoID, c.map.view);
	app.get('/:slug'+s+'/geo.json', c.map.json);
	app.get('/:groupSlug'+s+'/:partSlug'+s, c.post.seriesPost);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/map', c.map.seriesView);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/map/'+photoID, c.map.seriesView);
	app.get('/:slug'+s, c.post.view);
};

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 * @param app
 */
ControllerNamespace.authRoutes = function(app) {
	const c = ControllerNamespace.authorize;

	app.get('/auth/flickr', c.flickr);
	app.get('/auth/google', c.google);
	// all other routes begin authentication process
	app.get('*', c.view);
};

module.exports = ControllerNamespace;

// - Private static methods ---------------------------------------------------

/**
 * @param {Blog.Library} library
 * @return {String}
 */
function rootTagRoutePattern(library) {
	let rootPostTags = [];
	for (let name in library.tags) {	rootPostTags.push(library.tags[name].slug); }
	return ':rootTag(' + rootPostTags.join('|') + ')';
}