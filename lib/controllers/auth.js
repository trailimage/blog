"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const views_1 = require("../views/");
const models_1 = require("@trailimage/models");
function main(_req, res) {
    [
        models_1.config.providers.post,
        models_1.config.providers.map,
        models_1.config.providers.video
    ].forEach(async (p) => {
        if (tools_1.is.value(p) && !p.isAuthenticated) {
            const url = await p.authorizationURL();
            res.redirect(url);
            return;
        }
    });
}
exports.main = main;
function postAuth(req, res) {
    authCallback(models_1.config.providers.post, req, res);
}
exports.postAuth = postAuth;
function mapAuth(req, res) {
    authCallback(models_1.config.providers.map, req, res);
}
exports.mapAuth = mapAuth;
async function authCallback(p, req, res) {
    const token = await p.getAccessToken(req);
    res.render(views_1.Page.Authorize, {
        title: 'Flickr Access',
        token: token.access,
        secret: token.secret,
        layout: views_1.Layout.NONE
    });
}
exports.auth = { map: mapAuth, post: postAuth, main };
