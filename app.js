/**
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
var Setting = require('./settings.js');
var Format = require('./format.js');
/** @type {singleton} */
var Flickr = require('./flickr.js');
/** @type {singleton} */
var Cloud = require('./cloud.js');
/** @type {singleton} */
var Output = require('./output.js');
/** @type {Metadata} */
var Metadata = require('./metadata/metadata.js');
var Express = require('express');
var log = require('winston');

/**
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 */
var hbs = require('express-hbs');
var url = require('url');
var app = Express();
/** @type {Number} */
var port = process.env.VCAP_APP_PORT || 3000;

app.configure('all', function()
{
	Setting.isProduction = (process.env.NODE_ENV == 'production');
	Setting.redis = url.parse(process.env.REDISCLOUD_URL);
	Setting.redis.auth = Setting.redis.auth.split(":")[1];

	require('winston-redis').Redis;

	if (Setting.isProduction)
	{
		log.remove(log.transports.Console).add(log.transports.Redis,
		{
			host: Setting.redis.hostname,
			port: Setting.redis.port,
			auth: Setting.redis.auth,
			length: 10000
		});
	}
	log.error('Restarting %s application', (Setting.isProduction) ? 'production' : 'development');

	Cloud.make();
	Output.make();
	Flickr.make();

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
	hbs.registerHelper('formatLogTime', function(text) { return Format.logTime(text); });
	hbs.registerHelper('formatISO8601', function(text) { return Format.iso8601time(text); });

	app.use(Express.bodyParser());
	app.use(app.router);
	app.use(Express.static(__dirname + '/public'));

	Metadata.make(function()
	{
		defineRoutes();
		app.listen(port);
		log.info('Listening on port %d', port);
	});
});

function defineRoutes()
{
	/**
	 * Slug pattern
	 * @type {string}
	 */
	var s = '([\\w\\d-]{4,})';
	var clear = 'reset';
	var set = require('./routes/set-route.js');
	var contact = require('./routes/contact-route.js');
	var tag = require('./routes/tag-route.js');
	var logs = require('./routes/log-route.js');
	var rss = require('./routes/rss-route.js');
	var about = require('./routes/about-route.js');
	var search = require('./routes/search-route.js');
	var menu = require('./routes/menu-route.js');
	var sitemap = require('./routes/sitemap-route.js');
	var pdf = require('./routes/pdf-route.js');
	var authorize = require('./routes/authorize-route.js');

	app.get('/', set.default);                                       // the latest set
	app.get('/rss', rss.view);
	app.get('/'+clear, set.clearAll);
	app.get('/about', about.view);
	app.get('/about/'+clear, about.clear);
	app.get('/authorize', authorize.view);
	app.get('/contact', contact.view);
	app.get('/contact/'+clear, contact.clear);
	app.post('/contact', contact.send);
	app.get('/search', search.view);
	app.get('/browse', search.view);
	app.get('/menu/'+clear, menu.clear);
	app.get('/js/menu.js', menu.view);
	app.get('/sitemap.xml', sitemap.view);
	app.get('/sitemap/'+clear, sitemap.clear);
	app.get('/log/view', logs.view);
	app.get('/log/'+clear, logs.clear);
	app.get('/tag/'+clear, tag.clearAll);
	app.get('/:category(who|what|when|where|tag)/:tag/'+clear, tag.clear);
	app.get('/:category(who|what|when|where|tag)/:tag', tag.view);
	app.get('/:year(\\d{4})/:month(\\d{2})/:slug', set.blog);       // old blog links with format /YYYY/MM/slug
	app.get('/:photoID(\\d{10})', set.photoID);                     // links with bare Flickr photo ID
	app.get('/:setID(\\d{17})', set.flickrID);                      // links with bare Flickr set ID
	app.get('/:setID(\\d{17})/:photoID(\\d{10})', set.flickrID);
	app.get('/:slug'+s+'/pdf', pdf.view);
	app.get('/:slug'+s+'/'+clear, set.clear);
	app.get('/:slug'+s+'/new', set.newSet);
	app.get('/:groupSlug'+s+'/:partSlug'+s, set.subSet);
	app.get('/:groupSlug'+s+'/:partSlug'+s+'/'+clear, set.clearSubSet);
	app.get('/:slug'+s, set.view);
}

