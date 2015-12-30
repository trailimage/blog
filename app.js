'use strict';

/**
 * Application entry point
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
const TI = require('./lib');
const is = TI.is;
const config = TI.config;
const Express = require('express');
const npm = require('./package.json');

config.repoUrl = npm.repository.url;

injectDependencies();
createWebService();

function createWebService() {
	const app = Express();
	/** @type Number */
	const port = process.env['PORT'] || 3000;
	const log = TI.active.log;

	log.infoIcon(TI.icon.powerButton, 'Starting %s application', (config.isProduction) ? 'production' : 'development');

	defineViews(app);

	if (TI.active.needsAuth) {
		// must authenticate before normal routes are available
		defineAuthRoutes(app);
		app.listen(port);
		log.infoIcon(TI.icon.lock, 'Listening for authentication on port %d', port);
	} else {
		applyMiddleware(app);

		TI.Library.load(library => {
			// library must be loaded before routes are defined
			defineRoutes(app, library);
			app.listen(port);
			log.infoIcon(TI.icon.heartOutline, 'Listening on port %d', port);
		});
	}
}

/**
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 * @see http://mustache.github.com/mustache.5.html
 */
function defineViews(app) {
	/** @type ExpressHbs */
	const hbs = require('express-hbs');
	const format = TI.format;
	const engine = 'hbs';
	const root = __dirname;

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', root + '/views');
	app.set('view engine', engine);
	app.engine(engine, hbs.express4({
		defaultLayout: root + '/views/' + TI.template.layout.main + '.hbs',
		partialsDir: root + '/views/partials'
	}));

	// formatting methods for the views
	for (let name in format.helpers) {
		hbs.registerHelper(name, format.helpers[name]);
	}
}

/**
 * @param app
 * @see http://expressjs.com/api.html#app.use
 */
function applyMiddleware(app) {
	/** @see https://github.com/expressjs/compression/blob/master/README.md */
	const compress = require('compression');
	const bodyParser = require('body-parser');
	const outputCache = TI.Middleware.outputCache;
	const spamBlocker = TI.Middleware.referralBlocker;
	const statusHelper = TI.Middleware.statusHelper;

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
	app.use(statusHelper.methods);
	app.use(outputCache.methods);
	app.use(Express.static(__dirname + '/dist'));
}

/**
 * This should be what Express already supports but it isn't behaving as expected
 * @param {RegExp} regex
 * @param {Function} fn Middleware
 * @returns Function Wrapper
 */
function filter(regex, fn) {
	return (req, res, next) => {
		if (regex.test(req.originalUrl)) { fn(req, res, next); } else { next(); }
	}
}

/**
 * Inject provider dependencies
 */
function injectDependencies() {
	const FlickrPhoto = TI.Provider.Photo.Flickr;
	const GoogleFile = TI.Provider.File.Google;
	const redisUrl = config.env('REDISCLOUD_URL');
	const geoPrivacy = process.env['GEO_PRIVACY'];

	TI.Post.subtitleSeparator = config.style.subtitleSeparator;
	TI.Post.defaultAuthor = config.owner.name;

	if (!is.empty(geoPrivacy) && geoPrivacy.includes(',')) {
		config.map.privacyCenter = geoPrivacy.split(',').map(parseFloat);
		config.map.checkPrivacy = (config.map.privacyCenter.length == 2 && is.number(config.map.privacyMiles));
	}

	if (config.isProduction && is.empty(config.proxy)) {
		// replace default log provider with Redis
		TI.active.log = new TI.Provider.Log.Redis(redisUrl);
	}

	if (is.empty(config.proxy)) {
		TI.active.cacheHost = new TI.Provider.Cache.Redis(redisUrl);
	} else {
		// Redis won't work from behind proxy
		TI.active.log.info('Proxy detected — using default cache provider');
	}
	TI.active.photo = new FlickrPhoto({
		userID: '60950751@N04',
		appID: '72157631007435048',
		featureSets: [
			{ id: '72157632729508554', title: 'Ruminations' }
		],
		excludeSets: ['72157631638576162'],
		excludeTags: ['Idaho','United States of America','Abbott','LensTagger','Boise'],
		auth: new TI.Auth.Options(1,
			config.env('FLICKR_API_KEY'),
			config.env('FLICKR_SECRET'),
			`http://www.${config.domain}/auth/flickr`,
			process.env['FLICKR_ACCESS_TOKEN'],
			process.env['FLICKR_TOKEN_SECRET'])
	});

	TI.active.file = new GoogleFile({
		apiKey: config.env('GOOGLE_DRIVE_KEY'),
		tracksFolder: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
		auth: new TI.Auth.Options(2,
			config.env('GOOGLE_CLIENT_ID'),
			config.env('GOOGLE_SECRET'),
			`http://www.${config.domain}/auth/google`,
			process.env['GOOGLE_ACCESS_TOKEN'],
			process.env['GOOGLE_REFRESH_TOKEN'])
	});
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
		app.get('/' + slug, (req, res) => { res.redirect(TI.httpStatus.permanentRedirect, '/' + config.redirects[slug]); });
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
}

/**
 * @param {TI.Library} library
 * @return {String}
 */
function rootTagRoutePattern(library) {
	let rootPostTags = [];
	for (let name in library.tags) {	rootPostTags.push(library.tags[name].slug); }
	return ':rootTag(' + rootPostTags.join('|') + ')';
}

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 * @param app
 */
function defineAuthRoutes(app) {
	const c = TI.Controller.authorize;

	app.get('/auth/flickr', c.flickr);
	app.get('/auth/google', c.google);
	// all other routes begin authentication process
	app.get('*', c.view);
}