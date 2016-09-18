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
   const route = require('./lib/routes');
	const app = Express();
	const port = process.env['PORT'] || 3000;

	log.infoIcon(C.icon.powerButton, 'Starting %s application', config.isProduction ? 'production' : 'development');

	defineViews(app);

	if (config.needsAuth) {
		// must authenticate before normal routes are available
		route.authentication(app);
		app.listen(port);
		log.infoIcon(C.icon.lock, 'Listening for authentication on port %d', port);
	} else {
		applyMiddleware(app);

      factory.buildLibrary().then(() => {
         // library must be loaded before routes are defined
         route.standard(app);
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

/**
 * @see http://expressjs.com/api.html#app.use
 */
function applyMiddleware(app) {
	// https://github.com/expressjs/compression/blob/master/README.md
	const compress = require('compression');
	const bodyParser = require('body-parser');
   const middleware = require('./lib/middleware');

	app.use(middleware.blockSpamReferers);

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
	app.use(middleware.enableStatusHelpers);
	app.use(middleware.enableViewCache);
	app.use(Express.static(__dirname + '/dist'));
}

// this should be what Express already supports but it isn't behaving as expected
function filter(regex, fn) {
	return (req, res, next) => {
		if (regex.test(req.originalUrl)) { fn(req, res, next); } else { next(); }
	}
}