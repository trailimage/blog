"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const config_1 = require("../config");
const library_1 = require("../library");
const feed_1 = require("feed");
const constants_1 = require("../constants");
const MAX_RSS_RETRIES = 10;
let rssRetries = 0;
function feed(req, res) {
    if (!library_1.default.postInfoLoaded) {
        if (rssRetries >= MAX_RSS_RETRIES) {
            logger_1.default.error('Unable to load library after %d tries', MAX_RSS_RETRIES);
            res.render(constants_1.httpStatus.NOT_FOUND, { title: 'Unable to load feed' });
            rssRetries = 0;
        }
        else {
            rssRetries++;
            logger_1.default.error('Library not ready when creating RSS feed — attempt %d', rssRetries);
            setTimeout(() => { feed(req, res); }, 3000);
        }
        return;
    }
    const author = { name: config_1.default.owner.name, link: 'https://www.facebook.com/jason.e.abbott' };
    const copyright = 'Copyright © ' + new Date().getFullYear() + ' ' + config_1.default.owner.name + '. All rights reserved.';
    const feed = new feed_1.default({
        title: config_1.default.site.title,
        description: config_1.default.site.description,
        link: 'http://' + config_1.default.site.domain,
        image: 'http://' + config_1.default.site.domain + '/img/logo.png',
        copyright: copyright,
        author: author
    });
    for (const p of library_1.default.posts.filter(p => p.chronological)) {
        feed.addItem({
            image: p.bigThumbURL,
            author: author,
            copyright: copyright,
            title: p.title,
            link: config_1.default.site.url + '/' + p.key,
            description: p.description,
            date: p.createdOn
        });
    }
    res.set('Content-Type', constants_1.mimeType.XML);
    res.send(feed.rss2());
}
exports.default = feed;
