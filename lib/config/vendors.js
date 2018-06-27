"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const mapsource_1 = require("./mapsource");
exports.bing = {
    key: tools_1.env('BING_KEY', null)
};
exports.facebook = {
    appID: '110860435668134',
    pageID: '241863632579825',
    siteID: '578261855525416',
    adminID: '1332883594',
    enabled: true,
    authorURL: 'https://www.facebook.com/jason.e.abbott'
};
exports.google = {
    apiKey: tools_1.env('GOOGLE_KEY', null),
    projectID: '316480757902',
    analyticsID: '22180727',
    searchEngineID: tools_1.env('GOOGLE_SEARCH_ID', null),
    blogID: '118459106898417641'
};
exports.mapbox = {
    accessToken: tools_1.env('MAPBOX_ACCESS_TOKEN'),
    style: {
        dynamic: 'jabbott7/cj1qniq9r00322sqxt3pastcf',
        static: 'jabbott7/cj1prg25g002o2ro2xtzos6cy'
    },
    mapSource: mapsource_1.mapSource
};
