'use strict';

/**
 * Application entry point
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
const is = require('./lib/is.js');
const config = require('./lib/config.js');
const Express = require('express');
const cookieEncryption = [config.facebook.adminID];

injectDependencies();
createWebService();

function createWebService() {
	const app = Express();
	/** @type {Number} */
	const port = process.env['PORT'] || 3000;
	const log = config.provider.log;

	log.info('Starting %s application', (config.isProduction) ? 'production' : 'development');

	defineViews(app);
	applyMiddleware(app);

	if (config.provider.needsAuth) {
		// must authenticate before normal routes are available
		defineAuthRoutes(app);
		app.listen(port);
		log.info('Listening for authentication on port %d', port);
	} else {
		const Library = require('./lib/models/library.js');

		Library.load(() => {
			// library must be loaded before routes are defined
			defineRoutes(app);
			app.listen(port);
			//https.createServer(options, app).listen(port);
			log.info('Listening on port %d', port);
		});
	}
}

/**
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 * @see http://mustache.github.com/mustache.5.html
 */
function defineViews(app) {
	/** @type {ExpressHbs} */
	const hbs = require('express-hbs');
	const format = require('./lib/format.js');
	const template = require('./lib/template.js');
	const engine = 'hbs';
	const root = __dirname;

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', root + '/views');
	app.set('view engine', engine);
	app.engine(engine, hbs.express4({
		defaultLayout: root + '/views/' + template.layout.main + '.hbs',
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
	/** @see https://github.com/pillarjs/cookies/blob/master/README.md */
	//const Cookies = require('cookies');
	const wwwhisper = require('connect-wwwhisper');
	const outputCache = require('./lib/cache/output-cache.js');

	app.use(/^\/(admin|wwwhisper)(?!.*(delete|load)$)/, wwwhisper(false));
	//app.use(Cookies.express(keepCookie));
	app.use('/admin', [bodyParser.urlencoded({ extended: true }), bodyParser.json()]);
	//app.use(bodyParser.urlencoded({ extended: true }));
	//app.use(bodyParser.json());
	app.use(compress({}));
	app.use(outputCache());
	app.use(Express.static(__dirname + '/dist'));
}

/**
 * Inject provider dependencies
 */
function injectDependencies() {
	const OAuthOptions = require('./lib/auth/oauth-options.js');
	const RedisCache = require('./lib/providers/redis/redis-cache.js');
	const FlickrPhoto = require('./lib/providers/flickr/flickr-photo.js');
	const GoogleMap = require('./lib/providers/google/google-map.js');
	const redisUrl = config.env('REDISCLOUD_URL');

	if (config.isProduction) {
		// replace default log provider with Redis
		const RedisLog = require('./lib/providers/redis/redis-log.js');
		config.provider.log = new RedisLog(redisUrl);
	}

	if (is.empty(config.proxy)) {
		config.provider.cacheHost = new RedisCache(redisUrl);
	} else {
		// Redis won't work from behind proxy
		config.provider.log.info('Proxy detected — using default cache provider');
	}
	config.provider.photo = new FlickrPhoto({
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

	config.provider.map = new GoogleMap({
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
	app.get('/', r.tag.home);                                         // the latest posts
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
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', r.post.blog);       // old blog links with format /YYYY/MM/slug
	app.get('/photo-tag', r.photo.tags);
	app.get('/photo-tag/:tagSlug', r.photo.tags);
	app.get('/photo-tag/search/:tagSlug', r.photo.withTag);
	app.get('/'+photoID, r.photo.view);                                 // links with bare Flickr photo ID
	app.get('/'+postID, r.post.flickrID);                               // links with bare Flickr set ID
	app.get('/'+postID+'/'+photoID, r.post.flickrID);
	app.get('/:slug'+s+'/pdf', r.pdf.view);
	app.get('/:slug'+s+'/map', r.map.view);
	app.get('/:slug'+s+'/map/'+photoID, r.map.view);
	app.get('/:slug'+s+'/geo.json', r.map.json);
	app.get('/:groupSlug'+s+'/:partSlug'+s, r.post.seriesPost);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/map', r.map.seriesView);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/map/'+photoID, r.map.seriesView);
	app.get('/:slug'+s, r.post.view);
}

/**
 * If a provider isn't authenticated then all paths route to authentication pages
 * @param app
 */
function defineAuthRoutes(app) {
	const c = require('./lib/controllers/authorize-controller.js');

	app.get('/auth/flickr', c.flickr);
	app.get('/auth/google', c.google);
	// all other routes begin authentication process
	app.get('*', c.view);
}