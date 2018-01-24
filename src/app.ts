import { Blog } from "./types/";
import config from "./config";
import log from "./logger";
import * as Express from "express";
import * as hbs from "express-hbs";
import * as path from "path";
import template from "./template";
import factory from "./factory/";
import route from "./routes";
import * as compress from "compression";
import * as bodyParser from "body-parser";
import middleware from "./middleware";
import * as wwwhisper from "connect-wwwhisper";

const root = path.normalize(__dirname + "/../");

createWebService();

function createWebService() {
   const app = Express();
   const port = process.env["PORT"] || 3000;

   log.infoIcon("power-settings_new", "Starting %s application", config.isProduction ? "production" : "development");

   defineViews(app);

   if (config.needsAuth) {
      // must authenticate before normal routes are available
      route.authentication(app);
      app.listen(port);
      log.infoIcon("lock", "Listening for authentication on port %d", port);
   } else {
      applyMiddleware(app);

      factory.buildLibrary().then(() => {
         // library must be loaded before routes are defined
         route.standard(app);
         app.listen(port);
         log.infoIcon("hearing", "Listening on port %d", port);
      });
   }
}

// https://github.com/donpark/hbs/blob/master/examples/extend/app.js
// https://npmjs.org/package/express-hbs
// http://mustache.github.com/mustache.5.html
function defineViews(app: Express.Application) {
   const engine = "hbs";
   const views = path.normalize(root + "views/");

   // http://expressjs.com/4x/api.html#app-settings
   app.set("views", views);
   app.set("view engine", engine);
   app.engine(engine, hbs.express4({
      defaultLayout: views + template.layout.MAIN + ".hbs",
      partialsDir: views + "partials"
   }));

   template.assignHelpers(hbs);
}

/**
 * See http://expressjs.com/api.html#app.use
 */
function applyMiddleware(app: Express.Application) {
   // https://github.com/expressjs/compression/blob/master/README.md
   app.use(middleware.blockSpamReferers);

   if (config.usePersona) {
      // use wwwhisper middleware to authenticate some routes
      // https://devcenter.heroku.com/articles/wwwhisper

      //app.use(/\/admin|\/wwwhisper/gi, wwwhisper(false));
      app.use(filter(/^\/(admin|wwwhisper)/, wwwhisper(false)));
      //app.use(['/admin','/wwwhisper'], wwwhisper(false));
   }
   // needed to parse admin page posts with extended enabled for form select arrays
   app.use("/admin", bodyParser.urlencoded({ extended: true }));
   app.use(compress({}));
   app.use(middleware.enableStatusHelpers);
   app.use(middleware.enableViewCache);
   app.use(Express.static(root + "dist"));
}

// this should be what Express already supports but it isn't behaving as expected
function filter(regex: RegExp, fn: Function) {
   return (req: Blog.Request, res: Blog.Response, next: Function) => {
      if (regex.test(req.originalUrl)) { fn(req, res, next); } else { next(); }
   };
}