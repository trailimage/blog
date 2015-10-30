'use strict';

/**
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
const setting = require('./lib/settings.js');
const template = require('./lib/template.js');
const Express = require('express');
const log = require('./lib/log.js');

// middleware
const compress = require('compression');
const bodyParser = require('body-parser');
const cookies = require('cookies');
const wwwhisper = require('connect-wwwhisper');

// these depend on the redis settings
const outputCache = require('./lib/output-cache.js');

/**
 * @type {ExpressHbs}
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 */
const hbs = require('express-hbs');
const app = Express();
/** @type {Number} */
const port = process.env['PORT'] || 3000;

configure();

//- Private methods -----------------------------------------------------------

function configure() {
	const library = require('./lib/models/library.js');
	const format = require('./lib/format.js');

	log.error('Restarting %s application', (setting.isProduction) ? 'production' : 'development');

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', __dirname + '/views');
	/**
	 * Mustache templating
	 * @see http://mustache.github.com/mustache.5.html
	 */
	app.set('view engine', 'hbs');
	app.engine('hbs', hbs.express4({
		defaultLayout: __dirname + '/views/' + template.layout.main + '.hbs',
		partialsDir: __dirname + '/views/partials'
	}));

	for (let name in format.helpers) {
		hbs.registerHelper(name, format.helpers[name]);
	}

	app.use(filter(/^\/(admin|wwwhisper)(?!.*(delete|load)$)/, wwwhisper(false)));
	app.use(cookies.express([setting.flickr.userID, setting.facebook.adminID]));
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(compress());
	app.use(outputCache());
	app.use(Express.static(__dirname + '/dist'));

	library.load(() => {
		defineRoutes();
		app.listen(port);
		//https.createServer(options, app).listen(port);
		log.info('Listening on port %d', port);
	});
}

/**
 * Only apply middleware to paths matching pattern
 * @param {RegExp} regex
 * @param {Function} fn Middleware
 * @returns {Function}
 */
function filter(regex, fn) {
	return (req, res, next) => { if (regex.test(req.path)) { fn(req, res, next); } else { next(); }}
}

/**
 * @see http://expressjs.com/4x/api.html#router
 */
function defineRoutes() {
	/** @type {string} Slug pattern */
	const s = '([\\w\\d-]{4,})';
	/** @type {string} Flickr photo ID pattern */
	const photoID = ':photoID(\\d{10,11})';
	/** @type {string} Flickr set ID pattern */
	const postID = ':postID(\\d{17})';
	const r = require('./lib/controllers/routes.js');

	r.post.addFixes(app);

	app.use('/admin', r.admin);
	app.use('/api/v1', r.api);

	app.get('/', r.tag.home);                                       // the latest posts
	app.get('/rss', r.rss.view);
	app.get('/about', r.about.view);
	app.get('/authorize', r.authorize.view);
	app.get('/js/post-menu-data.js', r.menu.data);
	app.get('/sitemap.xml', r.sitemap.view);
    app.get('/exif/'+photoID, r.photo.exif);
	app.get('/issue', r.issue.view);
	app.get('/issues', r.issue.view);
	app.get('/issue/:slug'+s, r.issue.view);
	app.get('/tag-menu', r.tag.menu);
	app.get('/mobile-menu', r.menu.mobile);
	app.get('/search', r.search.view);
	app.get('/:category(who|what|when|where|tag)/:tag', r.tag.view);
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', r.post.blog);       // old blog links with format /YYYY/MM/slug
	app.get('/photo-tag', r.photo.tags);
	app.get('/photo-tag/:tagSlug', r.photo.tags);
	app.get('/photo-tag/search/:tagSlug', r.photo.withTag);
	app.get('/featured', r.post.featured);
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