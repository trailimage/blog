"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@toba/logger");
const block_spam_referer_1 = require("@toba/block-spam-referer");
const compress = require("compression");
const Express = require("express");
const handlebars_1 = require("@toba/handlebars");
const path = require("path");
const flickr_provider_1 = require("@trailimage/flickr-provider");
const google_provider_1 = require("@trailimage/google-provider");
const models_1 = require("@trailimage/models");
const config_1 = require("./config");
const views_1 = require("./views/");
const routes_1 = require("./routes");
const root = path.join(__dirname, '..');
configureModels();
createWebService();
function configureModels() {
    flickr_provider_1.postProvider.configure(config_1.config.providers.post);
    google_provider_1.mapProvider.configure(config_1.config.providers.map);
    models_1.config.site = config_1.config.site;
    models_1.config.owner = config_1.config.owner;
    models_1.config.subtitleSeparator = config_1.config.posts.subtitleSeparator;
    models_1.config.maxPhotoMarkersOnMap = config_1.config.providers.map.maxMarkers;
    models_1.config.providers.post = flickr_provider_1.postProvider;
    models_1.config.providers.map = google_provider_1.mapProvider;
}
exports.configureModels = configureModels;
async function createWebService() {
    const app = Express();
    const port = process.env['PORT'] || 3000;
    logger_1.log.info(`Starting ${config_1.config.isProduction ? 'production' : 'development'} application`);
    defineViews(app);
    if (false) {
        routes_1.route.authentication(app);
        app.listen(port);
        logger_1.log.info(`Listening for authentication on port ${port}`);
    }
    else {
        app.use(block_spam_referer_1.blockSpamReferers);
        app.use(compress());
        app.use(Express.static(path.join(root, 'public')));
        await models_1.blog.load();
        routes_1.route.standard(app);
        app.listen(port);
        logger_1.log.info(`Listening on port ${port}`);
    }
}
function defineViews(app) {
    const viewPath = path.join(root, 'views');
    const ehb = new handlebars_1.ExpressHandlebars({
        defaultLayout: views_1.Layout.Main
    });
    app.set('views', viewPath);
    app.set('view engine', ehb.fileExtension);
    app.engine(ehb.fileExtension, ehb.renderer);
    views_1.addTemplateMethods(ehb);
}
