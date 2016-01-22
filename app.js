'use strict';

/**
 * Application entry point
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
const Blog = require('./lib');
const is = Blog.is;
const config = Blog.config;
const Express = require('express');
const npm = require('./package.json');

config.repoUrl = npm.repository.url;

injectDependencies();
createWebService();

function createWebService() {
	const app = Express();
	/** @type Number */
	const port = process.env['PORT'] || 3000;
	const log = Blog.active.log;

	log.infoIcon(Blog.icon.powerButton, 'Starting %s application', (config.isProduction) ? 'production' : 'development');

	defineViews(app);

	if (Blog.active.needsAuth) {
		// must authenticate before normal routes are available
		Blog.Controller.authRoutes(app);
		app.listen(port);
		log.infoIcon(Blog.icon.lock, 'Listening for authentication on port %d', port);
	} else {
		applyMiddleware(app);

		Blog.Library.load(library => {
			// library must be loaded before routes are defined
			Blog.Controller.defaultRoutes(app, library, config, Blog.httpStatus);
			app.listen(port);
			log.infoIcon(Blog.icon.heartOutline, 'Listening on port %d', port);
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
	const engine = 'hbs';
	const root = __dirname;

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', root + '/views');
	app.set('view engine', engine);
	app.engine(engine, hbs.express4({
		defaultLayout: root + '/views/' + Blog.template.layout.main + '.hbs',
		partialsDir: root + '/views/partials'
	}));

	Blog.template.assignHelpers(hbs);
}

/**
 * @param app
 * @see http://expressjs.com/api.html#app.use
 */
function applyMiddleware(app) {
	/** @see https://github.com/expressjs/compression/blob/master/README.md */
	const compress = require('compression');
	const bodyParser = require('body-parser');
	const outputCache = require('@trailimage/output-cache');
	const spamBlocker = require('@trailimage/spam-block');
	const statusHelper = require('./lib/status-middleware.js');

	outputCache.enabled = Blog.config.cacheOutput;
	outputCache.view.config = Blog.config;
	outputCache.view.description = Blog.config.site.description;

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
	const RedisProvider = require('@trailimage/redis-provider');

	const geoPrivacy = process.env['GEO_PRIVACY'];

	Blog.Post.subtitleSeparator = config.style.subtitleSeparator;
	Blog.Post.defaultAuthor = config.owner.name;

	Blog.Map.Track.maxPossibleSpeed = config.map.maxPossibleSpeed;
	Blog.Map.Track.maxDeviationFeet = config.map.maxDeviationFeet;

	Blog.Map.Location.privacy.check = config.map.checkPrivacy;
	Blog.Map.Location.privacy.miles = config.map.privacyMiles;
	Blog.Map.Location.privacy.center = config.map.privacyCenter;

	Blog.LinkData.config.owner = config.owner;
	Blog.LinkData.config.site = config.site;

	if (!is.empty(geoPrivacy) && geoPrivacy.includes(',')) {
		config.map.privacyCenter = geoPrivacy.split(',').map(parseFloat);
		config.map.checkPrivacy = (config.map.privacyCenter.length == 2 && is.number(config.map.privacyMiles));
	}

	/** @type RedisProvider.Config */
	let c = new RedisProvider.Config();
	c.url = config.env('REDISCLOUD_URL');
	c.httpProxy = config.proxy;

	if (config.isProduction && is.empty(config.proxy)) {
		// replace default log provider with Redis
		Blog.active.log = new RedisProvider.Log(c);
	}

	if (is.empty(config.proxy)) {
		Blog.active.cacheHost = new RedisProvider.Cache(c);
	} else {
		// Redis won't work from behind proxy
		Blog.active.log.info('Proxy detected — using default cache provider');
	}

}