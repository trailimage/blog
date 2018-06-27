"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const map_provider_1 = require("./map-provider");
const post_provider_1 = require("./post-provider");
const models_1 = require("./models");
const redirects_1 = require("./redirects");
const vendors_1 = require("./vendors");
const views_1 = require("./views");
const isProduction = process.env['NODE_ENV'] === 'production';
exports.posts = {
    subtitleSeparator: ':',
    artistNames: ['Abbott', 'Wright', 'Bowman', 'Thomas', 'Reed'],
    defaultCategory: 'when'
};
exports.config = {
    env: tools_1.env,
    domain: models_1.domain,
    proxy: tools_1.env('HTTPS_PROXY', null),
    timestamp: new Date().getTime(),
    testing: false,
    isProduction: isProduction,
    repoUrl: 'https://github.com/Jason-Abbott/trail-image.git',
    owner: models_1.owner,
    site: models_1.site,
    posts: exports.posts,
    cache: {
        setAll(enabled) {
            this.views = enabled;
            this.maps = enabled;
        },
        views: isProduction,
        maps: true
    },
    contactLink: `<a href="mailto:${models_1.owner.email}">Contact</a>`,
    style: views_1.style,
    cacheDuration: tools_1.Duration.Day * 2,
    retryDelay: tools_1.Duration.Second * 30,
    bing: vendors_1.bing,
    google: vendors_1.google,
    facebook: vendors_1.facebook,
    providers: {
        map: map_provider_1.mapProvider,
        post: post_provider_1.postProvider
    },
    mapbox: vendors_1.mapbox,
    redirects: redirects_1.redirects,
    photoTagChanges: redirects_1.photoTagChanges,
    alwaysKeywords: 'Adventure, Scenery, Photography,',
    keywords: views_1.keywords.join(', ')
};
