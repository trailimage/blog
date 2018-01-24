"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const logger_1 = require("./logger");
const Express = require("express");
const hbs = require("express-hbs");
const path = require("path");
const template_1 = require("./template");
const _1 = require("./factory/");
const routes_1 = require("./routes");
const compress = require("compression");
const bodyParser = require("body-parser");
const middleware_1 = require("./middleware");
const wwwhisper = require("connect-wwwhisper");
const root = path.normalize(__dirname + "/../");
createWebService();
function createWebService() {
    const app = Express();
    const port = process.env["PORT"] || 3000;
    logger_1.default.infoIcon("power-settings_new", "Starting %s application", config_1.default.isProduction ? "production" : "development");
    defineViews(app);
    if (config_1.default.needsAuth) {
        routes_1.default.authentication(app);
        app.listen(port);
        logger_1.default.infoIcon("lock", "Listening for authentication on port %d", port);
    }
    else {
        applyMiddleware(app);
        _1.default.buildLibrary().then(() => {
            routes_1.default.standard(app);
            app.listen(port);
            logger_1.default.infoIcon("hearing", "Listening on port %d", port);
        });
    }
}
function defineViews(app) {
    const engine = "hbs";
    const views = path.normalize(root + "views/");
    app.set("views", views);
    app.set("view engine", engine);
    app.engine(engine, hbs.express4({
        defaultLayout: views + template_1.default.layout.MAIN + ".hbs",
        partialsDir: views + "partials"
    }));
    template_1.default.assignHelpers(hbs);
}
function applyMiddleware(app) {
    app.use(middleware_1.default.blockSpamReferers);
    if (config_1.default.usePersona) {
        app.use(filter(/^\/(admin|wwwhisper)/, wwwhisper(false)));
    }
    app.use("/admin", bodyParser.urlencoded({ extended: true }));
    app.use(compress({}));
    app.use(middleware_1.default.enableStatusHelpers);
    app.use(middleware_1.default.enableViewCache);
    app.use(Express.static(root + "dist"));
}
function filter(regex, fn) {
    return (req, res, next) => {
        if (regex.test(req.originalUrl)) {
            fn(req, res, next);
        }
        else {
            next();
        }
    };
}
//# sourceMappingURL=app.js.map