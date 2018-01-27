"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("../is");
const logger_1 = require("../logger");
const flickr_1 = require("../providers/flickr");
const _1 = require("../cache/");
const config_1 = require("../config");
const template_1 = require("../template");
const library_1 = require("../library");
const menuKeys = [
    template_1.default.page.MOBILE_MENU_DATA,
    template_1.default.page.POST_MENU_DATA,
    template_1.default.page.CATEGORY_MENU,
    template_1.default.page.SITEMAP
];
function view(res, viewKeys, apiKeys, mapKeys, logs) {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: 0
    });
    res.render(template_1.default.page.ADMINISTRATION, {
        logs,
        layout: template_1.default.layout.NONE,
        maps: is_1.default.array(mapKeys) ? mapKeys.sort() : null,
        views: is_1.default.array(viewKeys) ? viewKeys.sort() : null,
        apis: is_1.default.array(apiKeys) ? apiKeys.sort() : null,
        library: library_1.default,
        config: config_1.default
    });
}
function home(req, res) {
    logger_1.default.warnIcon('security', '%s viewing administration', req.clientIP());
    Promise.all([
        _1.default.api.keys(),
        _1.default.view.keys(),
        _1.default.map.keys(),
        logger_1.default.query(7)
    ]).then(([apiKeys, viewKeys, mapKeys, logs]) => {
        apiKeys = is_1.default.array(apiKeys)
            ? apiKeys.map(j => j.replace(_1.default.api.prefix, ''))
            : [];
        view(res, viewKeys, apiKeys, mapKeys, logs);
    });
}
function updateLibrary(_req, res) {
    return _1.default.api
        .remove(flickr_1.default.cache.keysForLibrary)
        .then(() => library_1.default.load(false).then(() => {
        if (library_1.default.changedKeys.length > 0) {
            let changedKeys = library_1.default.changedKeys;
            changedKeys = changedKeys.concat(menuKeys);
            changedKeys.sort();
            _1.default.view.remove(changedKeys).then(res.jsonMessage);
        }
        else {
            res.jsonMessage();
        }
    }))
        .catch(res.jsonError);
}
function deleteViewCache(req, res) {
    let viewKeys = [];
    const apiHashKeys = [];
    const removals = [];
    const includeRelated = req.body['includeRelated'] == 'true';
    for (const key of req.body['selected']) {
        const p = library_1.default.postWithKey(key);
        viewKeys.push(key);
        if (is_1.default.value(p)) {
            apiHashKeys.push(p.id);
            if (includeRelated) {
                viewKeys = viewKeys.concat(Object.keys(p.categories));
                if (is_1.default.value(p.next)) {
                    viewKeys.push(p.next.key);
                }
                if (is_1.default.value(p.previous)) {
                    viewKeys.push(p.previous.key);
                }
            }
        }
    }
    if (apiHashKeys.length > 0) {
        removals.push(_1.default.api.remove(flickr_1.default.cache.keysForPost, apiHashKeys));
        if (includeRelated) {
            viewKeys = viewKeys.concat(menuKeys.slice());
        }
    }
    removals.push(_1.default.view.remove(viewKeys));
    Promise.all(removals)
        .then(() => {
        library_1.default.unload(viewKeys);
        viewKeys.sort();
        res.jsonMessage(viewKeys.join());
    })
        .catch(res.jsonError);
}
function deleteMapCache(req, res) {
    const keys = req.body.selected;
    _1.default.map
        .remove(keys)
        .then(() => {
        for (const s of keys) {
            let p = library_1.default.postWithKey(s);
            if (is_1.default.value(p)) {
                p.triedTrack = false;
                while (p.nextIsPart) {
                    p = p.next;
                    p.triedTrack = false;
                }
            }
        }
        keys.sort();
        res.jsonMessage(keys.join());
    })
        .catch(res.jsonError);
}
function deleteApiCache(req, res) {
    const keys = req.body.selected;
    _1.default.api
        .remove(keys)
        .then(() => {
        keys.sort();
        res.jsonMessage(keys.join());
    })
        .catch(res.jsonError);
}
exports.default = {
    home,
    updateLibrary,
    cache: {
        deleteView: deleteViewCache,
        deleteMap: deleteMapCache,
        deleteJSON: deleteApiCache
    }
};
//# sourceMappingURL=admin.js.map