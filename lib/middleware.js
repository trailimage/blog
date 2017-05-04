"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("./is");
const logger_1 = require("./logger");
const config_1 = require("./config");
const _1 = require("./util/");
const cache_1 = require("./cache");
const constants_1 = require("./constants");
const node_fetch_1 = require("node-fetch");
const template_1 = require("./template");
const cacheKey = 'spam-referer';
let lastUpdate = 0;
let blackList = [];
let pending = [];
let isDownloading = false;
function blockSpamReferers(req, res, next) {
    const referer = req.get('referer');
    if (is_1.default.value(referer)) {
        checkSpammerList(_1.default.topDomain(referer)).then(spam => {
            if (spam) {
                logger_1.default.warnIcon('fingerprint', 'Spam blocked %s referer', referer);
                res.status(constants_1.httpStatus.NOT_FOUND).end();
            }
            else {
                next();
            }
        });
    }
    else {
        next();
    }
}
function checkSpammerList(domain) {
    if (blackList.length === 0) {
        return getSpammerList().then(list => {
            blackList = list;
            return blackList.indexOf(domain) !== -1;
        });
    }
    else {
        if (isStale()) {
            downloadSpammerList();
        }
        return Promise.resolve(blackList.indexOf(domain) !== -1);
    }
}
function getSpammerList() {
    return cache_1.default.getItem(cacheKey).then(list => {
        if (is_1.default.array(list)) {
            if (isStale()) {
                downloadSpammerList();
            }
            return list;
        }
        else {
            return downloadSpammerList();
        }
    });
}
const isStale = () => lastUpdate === 0 || (config_1.default.referralSpam.updateFrequency > 0 &&
    (new Date().getTime() - lastUpdate > config_1.default.referralSpam.updateFrequency));
function downloadSpammerList() {
    if (isDownloading) {
        logger_1.default.info('Spam referral black list is already downloading');
        return new Promise(resolve => { pending.push(resolve); });
    }
    else {
        isDownloading = true;
        logger_1.default.infoIcon('cloud_download', 'Downloading spam referral black list');
        return node_fetch_1.default(config_1.default.referralSpam.listUrl)
            .then(res => {
            if (res.status != constants_1.httpStatus.OK) {
                logger_1.default.error('%s returned status %s', config_1.default.referralSpam.listUrl, res.status);
                return null;
            }
            else {
                return res.text();
            }
        })
            .then(body => {
            let list = [];
            if (is_1.default.value(body)) {
                list = body.split('\n').filter(i => !is_1.default.empty(i));
                lastUpdate = new Date().getTime();
            }
            isDownloading = false;
            if (is_1.default.array(list) && list.length > 0) {
                for (const c of pending) {
                    c(list);
                }
                pending = [];
                logger_1.default.infoIcon('block', 'Downloaded %d blocked domains', list.length);
                cache_1.default.add(cacheKey, list);
                return list;
            }
            else {
                return [];
            }
        })
            .catch(err => {
            logger_1.default.error('Failed to download referer blacklist: %s', err.toString());
        });
    }
}
function enableStatusHelpers(req, res, next) {
    req.clientIP = () => {
        let ipAddress = req.connection.remoteAddress;
        const forwardedIP = req.header('x-forwarded-for');
        if (!is_1.default.empty(forwardedIP)) {
            const parts = forwardedIP.split(',');
            ipAddress = parts[0];
        }
        return _1.default.IPv6(ipAddress);
    };
    res.notFound = () => {
        logger_1.default.warnIcon('report_problem', `${req.originalUrl} not found for ${req.clientIP()}`);
        res.status(constants_1.httpStatus.NOT_FOUND);
        res.render(template_1.default.page.NOT_FOUND, { title: 'Page Not Found', config: config_1.default });
    };
    res.internalError = (err) => {
        if (is_1.default.value(err)) {
            logger_1.default.error(err);
        }
        res.status(constants_1.httpStatus.INTERNAL_ERROR);
        res.render(template_1.default.page.INTERNAL_ERROR, { title: 'Oops', config: config_1.default });
    };
    res.jsonError = (message) => {
        res.json({ success: false, message });
    };
    res.jsonMessage = (message) => {
        res.json({
            success: true,
            message: is_1.default.value(message) ? message : ''
        });
    };
    next();
}
function enableViewCache(req, res, next) {
    res.sendView = (key, options) => {
        if (!options.mimeType) {
            options.mimeType = constants_1.mimeType.HTML;
        }
        sendFromCacheOrRender(res, key, options);
    };
    res.sendJson = (key, generate) => {
        sendFromCacheOrRender(res, key, {
            mimeType: constants_1.mimeType.JSON,
            generate
        });
    };
    res.sendCompressed = (mimeType, item, cache = true) => {
        res.setHeader(constants_1.header.content.ENCODING, constants_1.encoding.GZIP);
        if (cache) {
            res.setHeader(constants_1.header.CACHE_CONTROL, 'max-age=86400, public');
        }
        else {
            res.setHeader(constants_1.header.CACHE_CONTROL, 'no-cache');
            res.setHeader(constants_1.header.EXPIRES, 'Tue, 01 Jan 1980 1:00:00 GMT');
            res.setHeader(constants_1.header.PRAGMA, 'no-cache');
        }
        res.setHeader(constants_1.header.E_TAG, item.eTag);
        res.setHeader(constants_1.header.content.TYPE, mimeType + ';charset=utf-8');
        res.write(item.buffer);
        res.end();
    };
    next();
}
function sendFromCacheOrRender(res, slug, options) {
    const generate = () => renderForType(res, slug, options);
    if (config_1.default.cache.views) {
        cache_1.default.view.getItem(slug)
            .then(item => {
            if (is_1.default.cacheItem(item)) {
                res.sendCompressed(options.mimeType, item);
            }
            else {
                logger_1.default.info('"%s" not cached', slug);
                generate();
            }
        })
            .catch(err => {
            logger_1.default.error('Error loading cached view', err);
            generate();
        });
    }
    else {
        logger_1.default.warn('Caching disabled for "%s"', slug);
        generate();
    }
}
function renderForType(res, slug, options) {
    if (options.mimeType === constants_1.mimeType.JSON) {
        cacheAndSend(res, JSON.stringify(options.generate()), slug, options.mimeType);
    }
    else if (is_1.default.callable(options.callback)) {
        options.callback(renderTemplate(res, slug, options.mimeType));
    }
    else {
        const render = renderTemplate(res, slug, options.mimeType);
        render(slug, options.templateValues);
    }
}
function renderTemplate(res, slug, type) {
    return (view, options, postProcess) => {
        if (is_1.default.empty(options.description)) {
            options.description = config_1.default.site.description;
        }
        options.config = config_1.default;
        res.render(view, options, (renderError, text) => {
            if (is_1.default.value(renderError)) {
                logger_1.default.error('Rendering %s %s', slug, renderError.message, renderError);
                res.internalError();
            }
            else {
                if (is_1.default.callable(postProcess)) {
                    text = postProcess(text);
                }
                cacheAndSend(res, text, slug, type);
            }
        });
    };
}
function cacheAndSend(res, html, slug, type) {
    cache_1.default.view.add(slug, html)
        .then(item => { res.sendCompressed(type, item); })
        .catch((err) => {
        logger_1.default.error('cacheAndSend() failed to add %s view to cache: %s', slug, err.toString());
        res.write(html);
        res.end();
    });
}
exports.default = {
    blockSpamReferers,
    enableStatusHelpers,
    enableViewCache,
    spamBlackListCacheKey: cacheKey
};
//# sourceMappingURL=middleware.js.map