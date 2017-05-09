"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const logger_1 = require("../logger");
const is_1 = require("../is");
const _1 = require("../util/");
const api_1 = require("../cache/api");
const node_fetch_1 = require("node-fetch");
const oauth_1 = require("oauth");
const https_1 = require("https");
https_1.globalAgent.maxSockets = 200;
const type = { USER: 'user_id', SET: 'photoset_id', PHOTO: 'photo_id' };
const url = {
    BASE: '/services/rest/',
    REQUEST_TOKEN: 'http://www.flickr.com/services/oauth/request_token',
    AUTHORIZE: 'http://www.flickr.com/services/oauth/authorize',
    ACCESS_TOKEN: 'http://www.flickr.com/services/oauth/access_token',
    PHOTO_SET: 'http://www.flickr.com/photos/trailimage/sets/'
};
const method = {
    COLLECTIONS: 'collections.getTree',
    photo: {
        EXIF: 'photos.getExif',
        SEARCH: 'photos.search',
        SETS: 'photos.getAllContexts',
        SIZES: 'photos.getSizes',
        TAGS: 'tags.getListUserRaw'
    },
    set: {
        INFO: 'photosets.getInfo',
        PHOTOS: 'photosets.getPhotos'
    }
};
const extra = {
    DESCRIPTION: 'description',
    TAGS: 'tags',
    DATE_TAKEN: 'date_taken',
    LOCATION: 'geo',
    PATH_ALIAS: 'path_alias'
};
const retries = {};
const host = 'api.flickr.com';
const oauth = new oauth_1.OAuth(url.REQUEST_TOKEN, url.ACCESS_TOKEN, config_1.default.flickr.auth.apiKey, config_1.default.flickr.auth.secret, '1.0A', config_1.default.flickr.auth.callback, 'HMAC-SHA1');
const defaultCallOptions = {
    value: r => r,
    error: null,
    sign: false,
    allowCache: false,
    args: {}
};
function call(method, idType, id, options) {
    options = Object.assign({}, defaultCallOptions, options);
    const noCache = () => callAPI(method, idType, id, options);
    return (config_1.default.cache.json && options.allowCache)
        ? api_1.default.getItem(method, id)
            .then(item => is_1.default.value(item) ? item : noCache())
            .catch((err) => {
            logger_1.default.error('Error getting Flickr %s:%s from cache: %j', method, id, err);
            return noCache();
        })
        : noCache();
}
function callAPI(method, idType, id, options) {
    const key = method + ':' + id;
    const methodUrl = 'https://' + host + url.BASE + parameterize(method, idType, id, options.args);
    return new Promise((resolve, reject) => {
        const token = config_1.default.flickr.auth.token;
        const handler = (err, body, attempt) => {
            let tryAgain = false;
            if (err === null) {
                const res = parse(body, key);
                if (res.stat == 'ok') {
                    clearRetries(key);
                    const parsed = options.value(res);
                    resolve(parsed);
                    if (config_1.default.cache.json && options.allowCache) {
                        api_1.default.add(method, id, parsed);
                    }
                }
                else {
                    tryAgain = res.retry;
                }
            }
            else {
                logger_1.default.error('Calling %s resulted in %j', methodUrl, err);
                tryAgain = true;
            }
            if (!tryAgain || (tryAgain && !retry(attempt, key))) {
                reject('Flickr ' + method + ' failed for ' + idType + ' ' + id);
            }
        };
        const attempt = options.sign
            ? () => oauth.get(methodUrl, token.access, token.secret, (error, body) => {
                handler(error, body, attempt);
            })
            : () => node_fetch_1.default(methodUrl, { headers: { 'User-Agent': 'node.js' } })
                .then(res => res.text())
                .then(body => { handler(null, body, attempt); })
                .catch(err => { handler(err, null, attempt); });
        attempt();
    });
}
function parse(body, key) {
    const fail = { retry: true, stat: 'fail' };
    let json = null;
    if (is_1.default.value(body)) {
        body = body.replace(/\\'/g, '\'');
    }
    try {
        json = JSON.parse(body);
        if (json === null) {
            logger_1.default.error('Call to %s returned null', key);
            json = fail;
        }
        else if (json.stat == 'fail') {
            logger_1.default.error('%s when calling %s [code %d]', json.message, key, json.code);
            if (json.message.includes('not found')) {
                json.retry = false;
            }
        }
    }
    catch (ex) {
        logger_1.default.error('Parsing call to %s resulted in %s', key, ex.toString());
        if (/<html>/.test(body)) {
            logger_1.default.error('Flickr returned HTML instead of JSON');
        }
        json = fail;
    }
    return json;
}
function retry(fn, key) {
    let count = 1;
    if (retries[key]) {
        count = ++retries[key];
    }
    else {
        retries[key] = count;
    }
    if (count > config_1.default.flickr.maxRetries) {
        retries[key] = 0;
        logger_1.default.error('Call to %s failed after %s tries', key, config_1.default.flickr.maxRetries);
        return false;
    }
    else {
        logger_1.default.warn('Retry %s for %s', count, key);
        setTimeout(fn, config_1.default.flickr.retryDelay);
        return true;
    }
}
function clearRetries(key) {
    if (retries[key] && retries[key] > 0) {
        logger_1.default.info('Call to %s succeeded', key);
        retries[key] = 0;
    }
}
function parameterize(method, idType, id, args = {}) {
    let qs = '';
    let op = '?';
    args.api_key = config_1.default.flickr.auth.apiKey;
    args.format = 'json';
    args.nojsoncallback = 1;
    args.method = 'flickr.' + method;
    if (is_1.default.value(idType) && is_1.default.value(id)) {
        args[idType] = id;
    }
    for (const k in args) {
        qs += op + k + '=' + encodeURIComponent(args[k].toString());
        op = '&';
    }
    return qs;
}
exports.default = {
    cache: {
        keysForPost: [method.set.INFO, method.set.PHOTOS],
        keysForPhoto: [method.photo.SIZES],
        keysForLibrary: [method.COLLECTIONS, method.photo.TAGS]
    },
    auth: {
        isEmpty() { return is_1.default.empty(config_1.default.flickr.auth.token.access); },
        url() { return config_1.default.flickr.auth.callback; },
        getRequestToken() {
            const token = config_1.default.flickr.auth.token;
            return new Promise((resolve, reject) => {
                oauth.getOAuthRequestToken((error, t, secret) => {
                    if (is_1.default.value(error)) {
                        reject(error);
                    }
                    else {
                        token.request = t;
                        token.secret = secret;
                        resolve(_1.default.format('{0}?oauth_token={1}', url.AUTHORIZE, t));
                    }
                });
            });
        },
        getAccessToken(requestToken, verifier) {
            const token = config_1.default.flickr.auth.token;
            return new Promise((resolve, reject) => {
                oauth.getOAuthAccessToken(requestToken, token.secret, verifier, (error, accessToken, accessTokenSecret) => {
                    token.secret = null;
                    if (is_1.default.value(error)) {
                        reject(error);
                    }
                    else {
                        resolve({
                            access: accessToken,
                            secret: accessTokenSecret,
                            accessExpiration: null
                        });
                    }
                });
            });
        }
    },
    getCollections: () => call(method.COLLECTIONS, type.USER, config_1.default.flickr.userID, {
        value: r => r.collections.collection,
        allowCache: true
    }),
    getSetInfo: (id) => call(method.set.INFO, type.SET, id, {
        value: r => r.photoset,
        allowCache: true
    }),
    getPhotoSizes: (id) => call(method.photo.SIZES, type.PHOTO, id, {
        value: r => r.sizes.size
    }),
    getPhotoContext: (id) => call(method.photo.SETS, type.PHOTO, id, {
        value: r => r.set
    }),
    getExif: (id) => call(method.photo.EXIF, type.PHOTO, id.toString(), {
        value: r => r.photo.exif,
        allowCache: true
    }),
    getSetPhotos: (id) => call(method.set.PHOTOS, type.SET, id, {
        args: {
            extras: [extra.DESCRIPTION, extra.TAGS, extra.DATE_TAKEN, extra.LOCATION, extra.PATH_ALIAS]
                .concat(config_1.default.flickr.photoSize.post)
                .join()
        },
        value: r => r.photoset,
        allowCache: true
    }),
    photoSearch: (tags) => call(method.photo.SEARCH, type.USER, config_1.default.flickr.userID, {
        args: {
            extras: config_1.default.flickr.photoSize.search.join(),
            tags: is_1.default.array(tags) ? tags.join() : tags,
            sort: 'relevance',
            per_page: 500
        },
        value: r => r.photos.photo,
        sign: true
    }),
    getAllPhotoTags: () => call(method.photo.TAGS, type.USER, config_1.default.flickr.userID, {
        value: r => r.who.tags.tag,
        sign: true,
        allowCache: true
    })
};
//# sourceMappingURL=flickr.js.map