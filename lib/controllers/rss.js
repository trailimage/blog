"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@toba/logger");
const tools_1 = require("@toba/tools");
const models_1 = require("@trailimage/models");
const feed_1 = require("@toba/feed");
const views_1 = require("../views/");
const MAX_RSS_RETRIES = 10;
let rssRetries = 0;
function postFeed(req, res) {
    if (!models_1.blog.postInfoLoaded) {
        if (rssRetries >= MAX_RSS_RETRIES) {
            logger_1.log.error(`Unable to load blog after ${MAX_RSS_RETRIES} tries`);
            views_1.view.notFound(req, res);
            rssRetries = 0;
        }
        else {
            rssRetries++;
            logger_1.log.error(`Blog posts not ready when creating RSS feed — attempt ${rssRetries}`);
            setTimeout(() => {
                postFeed(req, res);
            }, 1000);
        }
        return;
    }
    res.set(tools_1.Header.Content.Type, tools_1.MimeType.XML);
    res.write(feed_1.render(models_1.blog));
    res.end();
}
exports.postFeed = postFeed;
