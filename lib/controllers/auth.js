"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const config_1 = require("../config");
const template_1 = require("../template");
const flickr_1 = require("../providers/flickr");
const google_1 = require("../providers/google");
const constants_1 = require("../constants");
function view(req, res) {
    if (config_1.default.needsAuth) {
        if (flickr_1.default.auth.isEmpty()) {
            res.redirect(flickr_1.default.auth.url());
        }
        else if (google_1.default.auth.isEmpty()) {
            res.redirect(google_1.default.auth.url());
        }
    }
    else {
    }
}
function flickrAuth(req, res) {
    if (is_1.default.empty(req.param('oauth_token'))) {
        logger_1.default.warn('%s is updating Flickr tokens', req.clientIP());
        flickr_1.default.auth.getRequestToken().then(url => res.redirect(url));
    }
    else {
        const token = req.param('oauth_token');
        const verifier = req.param('oauth_verifier');
        flickr_1.default.auth.getAccessToken(token, verifier)
            .then(token => {
            res.render(template_1.default.page.AUTHORIZE, {
                title: 'Flickr Access',
                token: token.access,
                secret: token.secret,
                layout: template_1.default.layout.NONE
            });
        })
            .catch((err) => { logger_1.default.error(err); });
    }
}
function googleAuth(req, res) {
    const code = req.param('code');
    if (is_1.default.empty(code)) {
        res.end('Cannot continue without Google authorization code');
    }
    else {
        google_1.default.auth.getAccessToken(code)
            .then(token => {
            res.render(template_1.default.page.AUTHORIZE, {
                title: 'Google Access',
                token: token.access,
                secret: token.refresh,
                layout: template_1.default.layout.NONE
            });
        })
            .catch(err => {
            logger_1.default.error(err);
            res.status(constants_1.httpStatus.INTERNAL_ERROR);
            res.end(err.toString());
        });
    }
}
exports.default = { flickr: flickrAuth, google: googleAuth, view };
//# sourceMappingURL=auth.js.map