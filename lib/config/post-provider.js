"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
const flickr_provider_1 = require("@trailimage/flickr-provider");
const models_1 = require("./models");
exports.sizes = {
    thumb: [flickr_provider_1.Flickr.SizeCode.Square150],
    preview: [flickr_provider_1.Flickr.SizeCode.Small320],
    normal: [
        flickr_provider_1.Flickr.SizeCode.Large1024,
        flickr_provider_1.Flickr.SizeCode.Medium800,
        flickr_provider_1.Flickr.SizeCode.Medium640
    ],
    big: [
        flickr_provider_1.Flickr.SizeCode.Large2048,
        flickr_provider_1.Flickr.SizeCode.Large1600,
        flickr_provider_1.Flickr.SizeCode.Large1024
    ]
};
exports.postProvider = {
    photoSizes: exports.sizes,
    featureSets: [{ id: '72157632729508554', title: 'Ruminations' }],
    api: {
        userID: '60950751@N04',
        appID: '72157631007435048',
        timeZoneOffset: -7,
        searchPhotoSizes: [flickr_provider_1.Flickr.SizeCode.Square150],
        excludeSets: ['72157631638576162'],
        excludeTags: [
            'Idaho',
            'United States of America',
            'Abbott',
            'LensTagger',
            'Boise'
        ],
        maxRetries: 10,
        retryDelay: 300,
        auth: {
            apiKey: tools_1.env('FLICKR_API_KEY'),
            secret: tools_1.env('FLICKR_SECRET'),
            callback: 'http://www.' + models_1.domain + '/auth/flickr',
            token: {
                access: tools_1.env('FLICKR_ACCESS_TOKEN', null),
                secret: tools_1.env('FLICKR_TOKEN_SECRET', null),
                request: null
            }
        }
    }
};
