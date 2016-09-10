'use strict';

const is = require('./lib/is');
const config = require('./lib/config');
const C = require('./lib/constants');
const log = require('./lib/logger');
const Express = require('express');
const npm = require('./package.json');

config.repoUrl = npm.repository.url;

createWebService();

function createWebService() {
   const factory = require('./lib/factory');
	const app = Express();
	const port = process.env['PORT'] || 3000;

	log.infoIcon(C.icon.powerButton, 'Starting %s application', config.isProduction ? 'production' : 'development');

	defineViews(app);

	if (TI.active.needsAuth) {
		// must authenticate before normal routes are available
		defineAuthRoutes(app);
		app.listen(port);
		log.infoIcon(C.icon.lock, 'Listening for authentication on port %d', port);
	} else {
		applyMiddleware(app);

      factory.buildLibrary().then(library => {
         // library must be loaded before routes are defined
         defineRoutes(app, library);
         app.listen(port);
         log.infoIcon(C.icon.heartOutline, 'Listening on port %d', port);
      });
	}
}

// https://github.com/donpark/hbs/blob/master/examples/extend/app.js
// https://npmjs.org/package/express-hbs
// http://mustache.github.com/mustache.5.html
function defineViews(app) {
	const hbs = require('express-hbs');
   const template = require('./lib/template');
	const engine = 'hbs';
	const root = __dirname;

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', root + '/views');
	app.set('view engine', engine);
	app.engine(engine, hbs.express4({
		defaultLayout: root + '/views/' + template.layout.MAIN + '.hbs',
		partialsDir: root + '/views/partials'
	}));

   template.assignHelpers(hbs);
}

//  http://expressjs.com/api.html#app.use
function applyMiddleware(app) {
	// https://github.com/expressjs/compression/blob/master/README.md
	const compress = require('compression');
	const bodyParser = require('body-parser');
   const spamBlocker = require('./lib/middleware/referral-blocker');
   const statusHelper = require('./lib/middleware/status-helper');
   const viewCache = require('./lib/middleware/view-cache');

	app.use(spamBlocker.filter);

	if (config.usePersona) {
		// use wwwhisper middleware to authenticate some routes
		// https://devcenter.heroku.com/articles/wwwhisper
		const wwwhisper = require('connect-wwwhisper');

		//app.use(/\/admin|\/wwwhisper/gi, wwwhisper(false));
		app.use(filter(/^\/(admin|wwwhisper)/, wwwhisper(false)));
		//app.use(['/admin','/wwwhisper'], wwwhisper(false));
	}
	// needed to parse admin page posts with extended enabled for form select arrays
	app.use('/admin', bodyParser.urlencoded({ extended: true }));
	app.use(compress({}));
	app.use(statusHelper.apply);
	app.use(viewCache.apply);
	app.use(Express.static(__dirname + '/dist'));
}

// this should be what Express already supports but it isn't behaving as expected
function filter(regex, fn) {
	return (req, res, next) => {
		if (regex.test(req.originalUrl)) { fn(req, res, next); } else { next(); }
	}
}

/**
 * @param app
 * @param {TI.Library} library
 * @see http://expressjs.com/4x/api.html#router
 * @see http://expressjs.com/guide/routing.html
 */
function defineRoutes(app, library) {
	const c = TI.Controller;
	const r = require('./lib/controllers/routes.js');
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
		app.get('/' + slug, (req, res) => { res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + config.redirects[slug]); });
	}

	// the latest posts
	app.get('/', c.tag.home);
	app.get('/rss', c.rss.view);
	app.get('/about', c.ABOUT.view);
	app.get('/js/post-menu-data.js', c.menu.data);
	app.get('/sitemap.xml', c.SITEMAP.view);
	app.get('/exif/'+photoID, c.photo.EXIF);
	app.get('/issues?', c.issue.view);
	app.get('/issues?/:slug'+s, c.issue.view);
	app.get('/tag-menu', c.tag.menu);
	app.get('/mobile-menu', c.menu.mobile);
	app.get('/search', c.SEARCH.view);
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
}

function rootTagRoutePattern(library) {
	let rootPostTags = [];
	for (let name in library.tags) {	rootPostTags.push(library.tags[name].slug); }
	return ':rootTag(' + rootPostTags.join('|') + ')';
}

// if a provider isn't authenticated then all paths route to authentication pages
function defineAuthRoutes(app) {
	const c = TI.Controller.AUTHORIZE;

	app.get('/auth/flickr', c.flickr);
	app.get('/auth/google', c.google);
	// all other routes begin authentication process
	app.get('*', c.view);
}