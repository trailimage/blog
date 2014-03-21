/**
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
var Setting = require('./settings.js');
var Format = require('./format.js');
var Express = require('express');
var log = require('winston');
var url = require('url');
// middleware
var compress = require('compression');
var bodyParser = require('body-parser');
var cookies = require('cookies');

Setting.isProduction = (process.env.NODE_ENV == 'production');
Setting.redis = url.parse(process.env.REDISCLOUD_URL);
Setting.redis.auth = Setting.redis.auth.split(":")[1];
Setting.cacheOutput = Setting.isProduction;

// these depend on the redis settings
var outputCache = require('./outputCache.js');
var library = require('./models/library.js');

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

	if (Setting.isProduction)
	{
        log.add(log.transports.Redis,
		{
			host: Setting.redis.hostname,
			port: Setting.redis.port,
			auth: Setting.redis.auth,
			length: 10000
		});
	}
	log.error('Restarting %s application', (Setting.isProduction) ? 'production' : 'development');

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

	hbs.registerHelper('formatCaption', function(text) { return Format.story(text); });
	hbs.registerHelper('formatTitle', function(text) { return Format.text(text); });
	hbs.registerHelper('add', function(a, b) { return (a * 1) + b; });
	hbs.registerHelper('makeSlug', function(text) { return Format.slug(text); });
	hbs.registerHelper('makeTagList', function(list) { return Format.tagList(list); });
	hbs.registerHelper('formatLogTime', function(text) { return Format.logTime(text); });
	hbs.registerHelper('formatISO8601', function(text) { return Format.iso8601time(text); });
	hbs.registerHelper('formatFraction', function(text) { return Format.fraction(text); });
	hbs.registerHelper('icon', function(name) { return Format.icon(name); });

	app.use(cookies.express([Setting.flickr.userID, Setting.facebook.adminID]));
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
	var post = require('./routes/post-route.js');
	var contact = require('./routes/contact-route.js');
	var tag = require('./routes/tag-route.js');
	var rss = require('./routes/rss-route.js');
	var about = require('./routes/about-route.js');
	var search = require('./routes/search-route.js');
	var menu = require('./routes/menu-route.js');
	var sitemap = require('./routes/sitemap-route.js');
	var pdf = require('./routes/pdf-route.js');
	var authorize = require('./routes/authorize-route.js');
    var photo = require('./routes/photo-route.js');
	var issue = require('./routes/issue-route.js');
	var admin = require('./routes/admin-route.js');

	post.addFixes(app);

	app.get('/admin', admin.home);
	app.post('/admin', admin.login);
	app.get('/admin/issue/save', admin.saveIssue);
	app.get('/admin/issue/new', admin.newIssue);
	app.get('/admin/issue/delete', admin.deleteIssue);
	app.get('/', post.home);                                       // the latest set
	app.get('/rss', rss.view);
	app.get('/about', about.view);
	app.get('/authorize', authorize.view);
	app.get('/contact', contact.view);
	app.post('/contact', contact.send);
	app.get('/search', search.view);
	app.get('/browse', search.view);
	app.get('/js/menu.js', menu.view);
	app.get('/sitemap.xml', sitemap.view);
    app.get('/exif/'+photoID, photo.exif);
	app.get('/issue', issue.home);
	app.get('/issue/:slug'+s, issue.view);
	app.get('/:category(who|what|when|where|tag)/:tag', tag.view);
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', post.blog);       // old blog links with format /YYYY/MM/slug
	app.get('/photo-tag', photo.tags);
	app.get('/photo-tag/:tagSlug', photo.tags);
	app.get('/photo-tag/search/:tagSlug', photo.search);
	app.get('/featured', post.featured);
	app.get('/'+photoID, photo.view);                              // links with bare Flickr photo ID
	app.get('/'+postID, post.flickrID);                               // links with bare Flickr set ID
	app.get('/'+postID+'/'+photoID, post.flickrID);
	app.get('/:slug'+s+'/pdf', pdf.view);
	app.get('/:groupSlug'+s+'/:partSlug'+s, post.seriesPost);
	app.get('/:slug'+s, post.view);
}