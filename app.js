'use strict';

/**
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
let setting = require('./lib/settings.js');
var format = require('./lib/format.js');
var Express = require('express');
let log = require('./lib/log.js');

// middleware
var compress = require('compression');
var bodyParser = require('body-parser');
var cookies = require('cookies');
var wwwhisper = require('connect-wwwhisper');

// these depend on the redis settings
var outputCache = require('./lib/output-cache.js');
var library = require('./lib/models/library.js');

/**
 * @type {ExpressHbs}
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 */
var hbs = require('express-hbs');
var app = Express();
/** @type {Number} */
const port = process.env['PORT'] || 3000;

configure();

function configure() {
	log.error('Restarting %s application', (setting.isProduction) ? 'production' : 'development');

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', __dirname + '/views');
	/**
	 * Mustache templating
	 * @see http://mustache.github.com/mustache.5.html
	 */
	app.set('view engine', 'hbs');
	app.engine('hbs', hbs.express4({
		defaultLayout: __dirname + '/views/' + setting.layout.default + '.hbs',
		partialsDir: __dirname + '/views/partials'
	}));

	hbs.registerHelper('formatCaption', text => format.story(text));
	hbs.registerHelper('formatTitle', text => format.typography(text));
	hbs.registerHelper('add', (a, b) => (a * 1) + b);
	hbs.registerHelper('subtract', (a, b) => (a * 1) - b);
	hbs.registerHelper('makeSlug', text => format.slug(text));
	hbs.registerHelper('makeTagList', list => format.tagList(list));
	hbs.registerHelper('formatLogTime', text => format.logTime(text));
	hbs.registerHelper('formatISO8601', text => format.iso8601time(text));
	hbs.registerHelper('formatFraction', text => format.fraction(text));
	hbs.registerHelper('mapHeight', (width, height) => height > width ? 200 : height);
	hbs.registerHelper('icon', name => format.icon(name));
	hbs.registerHelper('rot13', text => format.rot13(text));

	app.use(filter(/^\/(admin|wwwhisper)(?!.*(delete|load)$)/, wwwhisper(false)));
	app.use(cookies.express([setting.flickr.userID, setting.facebook.adminID]));
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(compress());
	app.use(outputCache());
	app.use(Express.static(__dirname + '/public'));

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
	app.get('/js/menu-data.js', r.menu.view);
	app.get('/sitemap.xml', r.sitemap.view);
    app.get('/exif/'+photoID, r.photo.exif);
	app.get('/issue', r.issue.view);
	app.get('/issues', r.issue.view);
	app.get('/issue/:slug'+s, r.issue.view);
	app.get('/tag-menu', r.tag.menu);
	app.get('/search', r.search.view);
	app.get('/:category(who|what|when|where|tag)/:tag', r.tag.view);
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', r.post.blog);       // old blog links with format /YYYY/MM/slug
	app.get('/photo-tag', r.photo.tags);
	app.get('/photo-tag/:tagSlug', r.photo.tags);
	app.get('/photo-tag/search/:tagSlug', r.photo.search);
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