'use strict';

/**
 * @see http://code.google.com/apis/console/?pli=1#project:1033232213688:access
 */
const setting = require('./lib/settings.js');
const format = require('./lib/format.js');
const Express = require('express');
const log = require('./lib/log.js');
const routes = require('./lib/controllers/routes.js');
const library = require('./lib/models/library.js');
/**
 * @type {ExpressHbs}
 * @see https://github.com/donpark/hbs/blob/master/examples/extend/app.js
 * @see https://npmjs.org/package/express-hbs
 */
const hbs = require('express-hbs');
const app = Express();
/** @type {Number} */
const port = process.env['PORT'] || 3000;

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

for (let name in format.helpers) { hbs.registerHelper(name, format.helpers[name]); }

app.use(compress());
app.use(outputCache());
app.use(Express.static(__dirname + '/public'));

library.load(() => {
	app.listen(port);
	//https.createServer(options, app).listen(port);
	log.info('Listening on port %d', port);
});