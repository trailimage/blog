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
 * @param {Library} library
 * @see http://expressjs.com/4x/api.html#router
 * @see http://expressjs.com/guide/routing.html
 */
function defineRoutes(app, library) {
	const c = require('./lib/controller');
	const r = require('./lib/routes');
	// slug pattern
	const s = '([\\w\\d-]{4,})';
   // route placeholders
   const ph = C.route;
	// Flickr photo ID pattern
	const photoID = `:${ph.PHOTO_ID}(\\d{10,11})`;
	// Flickr set ID pattern
	const postID = `:${ph.POST_ID}(\\d{17})`;
   // post key (slug or path) pattern
   const postKey = `:${ph.POST_KEY}${s}`;
   const series = `:${ph.SERIES_KEY}${s}/:${ph.PART_KEY}${s}`;
	// pattern matching any root category key
	const rootCategory = ':' + ph.ROOT_CATEGORY + '(' + Object
      .keys(library.categories)
      .map(name => library.categories[name].key)
      .join('|') + ')';

	app.use('/admin', r.admin);
	//app.use('/api/v1', r.api);
	//app.use('/auth', r.auth);

	for (let slug in config.redirects) {
		app.get('/' + slug, (req, res) => {
		   res.redirect(C.httpStatus.PERMANENT_REDIRECT, '/' + config.redirects[slug]);
		});
	}

	// the latest posts
	app.get('/', c.post.home);
	app.get('/rss', c.rss.view);
	app.get('/about', c.about);
	app.get('/js/post-menu-data.js', c.menu.data);
	app.get('/sitemap.xml', c.siteMap);
	app.get(`/exif/${photoID}`, c.photo.exif);
	app.get('/issues?', c.issues);
	app.get('/issues?/:slug'+s, c.issues);
	app.get('/category-menu', c.menu.category);
	app.get('/mobile-menu', c.menu.mobile);
	app.get('/search', c.search);
	app.get(`/${rootCategory}`, c.category.root);
	app.get(`/${rootCategory}/:${ph.CATEGORY}`, c.category.view);
	// old blog links with format /YYYY/MM/slug
	app.get(`/:${ph.YEAR}(\\d{4})/:${ph.MONTH}(\\d{2})/:${ph.POST_KEY}`, c.post.date);
	app.get('/photo-tag', c.photo.tags);
	app.get(`/photo-tag/:${ph.PHOTO_TAG}`, c.photo.tags);
	app.get(`/photo-tag/search/:${ph.PHOTO_TAG}`, c.photo.withTag);
	// links with bare photo provider ID
	app.get(`/${photoID}`, c.photo.view);
	// links with bare photo provider set ID
	app.get(`/${postID}`, c.post.providerID);
	app.get(`/${postID}/${photoID}`, c.post.providerID);

	app.get(`/${postKey}/pdf`, c.pdf);
	app.get(`/${postKey}/map`, c.map.view);
	app.get(`/${postKey}/gpx`, c.map.download);
	app.get(`/${postKey}/map/${photoID}`, c.map.view);
	app.get(`/${postKey}/geo.json`, c.map.json);

   app.get(`/${series}`, c.post.inSeries);
	app.get(`/${series}/map`, c.map.forSeries);
	app.get(`/${series}/map/${photoID}`, c.map.forSeries);
	app.get(`/${postKey}`, c.post.view);
}

// if a provider isn't authenticated then all paths route to authentication pages
function defineAuthRoutes(app) {
   const c = require('./lib/controller');

	app.get('/auth/flickr', c.auth.flickr);
	app.get('/auth/google', c.auth.google);
	// all other routes begin authentication process
	app.get('*', c.auth.view);
}