'use strict';

/**
 * Application entry point
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
const lib = require('./lib/index.js');
const is = lib.is;
const Enum = lib.enum;
const config = lib.config;
const Express = require('express');
const npm = require('./package.json');

config.repoUrl = npm.repository.url;

injectDependencies();
createWebService();

function createWebService() {
	const app = Express();
	/** @type {Number} */
	const port = process.env['PORT'] || 3000;
	const log = lib.provider.log;

	log.infoIcon(Enum.icon.powerButton, 'Starting %s application', (config.isProduction) ? 'production' : 'development');

	defineViews(app);

	if (lib.provider.needsAuth) {
		// must authenticate before normal routes are available
		defineAuthRoutes(app);
		app.listen(port);
		log.infoIcon(Enum.icon.lock, 'Listening for authentication on port %d', port);
	} else {
		applyMiddleware(app);

		lib.Library.load(() => {
			// library must be loaded before routes are defined
			defineRoutes(app);
			app.listen(port);
			log.infoIcon(Enum.icon.heartOutline, 'Listening on port %d', port);
		});
	}
}

/**
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 * @see http://mustache.github.com/mustache.5.html
 */
function defineViews(express) {
	/** @type {ExpressHbs} */
	const hbs = require('express-hbs');
	const format = lib.format;
	const engine = 'hbs';
	const root = __dirname;

	// http://expressjs.com/4x/api.html#app-settings
	express.set('views', root + '/views');
	express.set('view engine', engine);
	express.engine(engine, hbs.express4({
		defaultLayout: root + '/views/' + lib.template.layout.main + '.hbs',
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
	const outputCache = require('./lib/middleware/output-cache.js');
	const spamBlocker = require('./lib/middleware/referral-blocker.js');

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
	app.use(outputCache.methods);
	app.use(Express.static(__dirname + '/dist'));
}

/**
 * This should be what Express already supports but it isn't behaving as expected
 * @param {RegExp} regex
 * @param {Function} fn Middleware
 * @returns {Function} Wrapper
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
	const OAuthOptions = lib.Auth.Options;
	const FlickrPhoto = require('./lib/providers/flickr/flickr-photo.js');
	const GoogleFile = require('./lib/providers/google/google-file.js');
	const redisUrl = config.env('REDISCLOUD_URL');
	const geoPrivacy = process.env['GEO_PRIVACY'];

	if (!is.empty(geoPrivacy) && geoPrivacy.includes(',')) {
		config.map.privacyCenter = geoPrivacy.split(',').map(parseFloat);
		config.map.checkPrivacy = (config.map.privacyCenter.length == 2 && is.number(config.map.privacyMiles));
	}

	if (config.isProduction) {
		// replace default log provider with Redis
		lib.provider.log = new lib.Log.Redis(redisUrl);
	}

	if (is.empty(config.proxy)) {
		lib.provider.cacheHost = new lib.Cache.Redis(redisUrl);
	} else {
		// Redis won't work from behind proxy
		lib.provider.log.info('Proxy detected — using default cache provider');
	}
	lib.provider.photo = new FlickrPhoto({
		userID: '60950751@N04',
		appID: '72157631007435048',
		featureSets: [
			{ id: '72157632729508554', title: 'Ruminations' }
		],
		excludeSets: ['72157631638576162'],
		excludeTags: ['Idaho','United States of America','Abbott','LensTagger','Boise'],
		auth: new OAuthOptions(1,
			config.env('FLICKR_API_KEY'),
			config.env('FLICKR_SECRET'),
			`http://www.${config.domain}/auth/flickr`,
			process.env['FLICKR_ACCESS_TOKEN'],
			process.env['FLICKR_TOKEN_SECRET'])
	});

	lib.provider.file = new GoogleFile({
		apiKey: config.env('GOOGLE_DRIVE_KEY'),
		tracksFolder: '0B0lgcM9JCuSbMWluNjE4LVJtZWM',
		auth: new OAuthOptions(2,
			config.env('GOOGLE_CLIENT_ID'),
			config.env('GOOGLE_SECRET'),
			`http://www.${config.domain}/auth/google`,
			process.env['GOOGLE_ACCESS_TOKEN'],
			process.env['GOOGLE_REFRESH_TOKEN'])
	});
}

/**
 * @see http://expressjs.com/4x/api.html#router
 * @see http://expressjs.com/guide/routing.html
 */
function defineRoutes(app) {
	const Enum = app.enum;
	const r = require('./lib/controllers/routes.js');
	/** @type {string} Slug pattern */
	const s = '([\\w\\d-]{4,})';
	/** @type {string} Flickr photo ID pattern */
	const photoID = ':photoID(\\d{10,11})';
	/** @type {string} Flickr set ID pattern */
	const postID = ':postID(\\d{17})';

	app.use('/admin', r.admin);
	app.use('/api/v1', r.api);
	//app.use('/auth', r.auth);

	for (let slug in config.redirects) {
		app.get('/' + slug, (req, res) => { res.redirect(Enum.httpStatus.permanentRedirect, '/' + config.redirects[slug]); });
	}
	// the latest posts
	app.get('/', r.tag.home);
	app.get('/rss', r.rss.view);
	app.get('/about', r.about.view);
	app.get('/js/post-menu-data.js', r.menu.data);
	app.get('/sitemap.xml', r.sitemap.view);
	app.get('/exif/'+photoID, r.photo.exif);
	app.get('/issues?', r.issue.view);
	app.get('/issues?/:slug'+s, r.issue.view);
	app.get('/tag-menu', r.tag.menu);
	app.get('/mobile-menu', r.menu.mobile);
	app.get('/search', r.search.view);
	app.get('/:category(who|what|when|where|tag)/:tag', r.tag.view);
	// old blog links with format /YYYY/MM/slug
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', r.post.blog);
	app.get('/photo-tag', r.photo.tags);
	app.get('/photo-tag/:tagSlug', r.photo.tags);
	app.get('/photo-tag/search/:tagSlug', r.photo.withTag);
	// links with bare photo provider ID
	app.get('/'+photoID, r.photo.view);
	// links with bare photo provider set ID
	app.get('/'+postID, r.post.providerID);
	app.get('/'+postID+'/'+photoID, r.post.providerID);
	app.get('/:slug'+s+'/pdf', r.pdf.view);
	app.get('/:slug'+s+'/map', r.map.view);
	app.get('/:slug'+s+'/gpx', r.map.download);
	app.get('/:slug'+s+'/map/'+photoID, r.map.view);
	app.get('/:slug'+s+'/geo.json', r.map.json);
	app.get('/:groupSlug'+s+'/:partSlug'+s, r.post.seriesPost);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/map', r.map.seriesView);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/map/'+photoID, r.map.seriesView);
	app.get('/:slug'+s, r.post.view);
}

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 * @param express
 */
function defineAuthRoutes(express) {
	const c = require('./lib/controllers/authorize-controller.js');

	express.get('/auth/flickr', c.flickr);
	express.get('/auth/google', c.google);
	// all other routes begin authentication process
	express.get('*', c.view);
}