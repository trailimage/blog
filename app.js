/**
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
var setting = require('./lib/settings.js');
var format = require('./lib/format.js');
var Express = require('express');
var log = require('winston');
var url = require('url');
// middleware
var compress = require('compression');
var bodyParser = require('body-parser');
var cookies = require('cookies');

setting.isProduction = (process.env.NODE_ENV == 'production');
setting.redis = url.parse(process.env.REDISCLOUD_URL);
setting.redis.auth = setting.redis.auth.split(":")[1];
setting.cacheOutput = setting.isProduction;

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
var port = process.env.PORT || 3000;

configure();

function configure()
{
	require('winston-redis').Redis;

	if (setting.isProduction)
	{
        log.add(log.transports.Redis,
		{
			host: setting.redis.hostname,
			port: setting.redis.port,
			auth: setting.redis.auth,
			length: 10000
		});
	}
	log.error('Restarting %s application', (setting.isProduction) ? 'production' : 'development');

	// http://expressjs.com/4x/api.html#app-settings
	app.set('views', __dirname + '/views');
	/**
	 * Mustache templating
	 * @see http://mustache.github.com/mustache.5.html
	 */
	app.set('view engine', 'hbs');
	app.engine('hbs', hbs.express3(
	{
		defaultLayout: __dirname + '/views/layouts/default.hbs',
		partialsDir: __dirname + '/views/partials'
	}));

	hbs.registerHelper('formatCaption', function(text) { return format.story(text); });
	hbs.registerHelper('formatTitle', function(text) { return format.text(text); });
	hbs.registerHelper('add', function(a, b) { return (a * 1) + b; });
	hbs.registerHelper('makeSlug', function(text) { return format.slug(text); });
	hbs.registerHelper('makeTagList', function(list) { return format.tagList(list); });
	hbs.registerHelper('formatLogTime', function(text) { return format.logTime(text); });
	hbs.registerHelper('formatISO8601', function(text) { return format.iso8601time(text); });
	hbs.registerHelper('formatFraction', function(text) { return format.fraction(text); });
	hbs.registerHelper('icon', function(name) { return format.icon(name); });
	hbs.registerHelper('obfuscate', function(text) { return format.characterEntities(text); });

	app.use(cookies.express([setting.flickr.userID, setting.facebook.adminID]));
	app.use(bodyParser());
	app.use(compress());
	app.use(outputCache());
	app.use(Express.static(__dirname + '/public'));

	library.load(function()
	{
		defineRoutes();
		app.listen(port);
		log.info('Listening on port %d', port);
	});
}

function defineRoutes()
{
	/** @type {string} Slug pattern */
	var s = '([\\w\\d-]{4,})';
    /** @type {string} Flickr photo ID pattern */
    var photoID = ':photoID(\\d{10,11})';
    /** @type {string} Flickr set ID pattern */
    var postID = ':postID(\\d{17})';
	var r = require('./lib/controllers/routes.js');

	r.post.addFixes(app);

	app.get('/admin', r.admin.home);
	app.post('/admin', r.admin.login);
	app.get('/admin/issue/save', r.admin.saveIssue);
	app.get('/admin/issue/delete', r.admin.deleteIssue);
	app.post('/admin/view/delete', r.admin.deleteView);
	app.post('/admin/track/upload', r.admin.uploadTrack);
	app.post('/admin/library/reload', r.admin.reloadLibrary);
	app.post('/admin/photo-tag/reload', r.admin.reloadPhotoTags);
	app.get('/', r.post.home);                                       // the latest set
	app.get('/rss', r.rss.view);
	app.get('/about', r.about.view);
	app.get('/authorize', r.authorize.view);
	app.get('/search', r.search.view);
	app.get('/browse', r.search.view);
	app.get('/js/menu.js', r.menu.view);
	app.get('/sitemap.xml', r.sitemap.view);
    app.get('/exif/'+photoID, r.photo.exif);
	app.get('/issue', r.issue.home);
	app.get('/issue/:slug'+s, r.issue.view);
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
	app.get('/:slug'+s+'/geo.json', r.map.json);
	app.get('/:groupSlug'+s+'/:partSlug'+s, r.post.seriesPost);
	app.get('/:slug'+s, r.post.view);
}