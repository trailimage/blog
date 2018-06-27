"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("@toba/tools");
exports.domain = 'trailimage.com';
const url = `http://www.${exports.domain}`;
exports.owner = {
    name: 'Jason Abbott',
    image: {
        url: url + '/img/face4_300px.jpg',
        width: 300,
        height: 300
    },
    email: tools_1.env('EMAIL_CONTACT', null),
    urls: [
        'https://www.facebook.com/jason.e.abbott',
        'http://www.flickr.com/photos/boise',
        'https://www.youtube.com/user/trailimage',
        'https://twitter.com/trailimage'
    ]
};
exports.site = {
    domain: exports.domain,
    title: 'Trail Image',
    subtitle: 'Adventure Photography by ' + exports.owner.name,
    description: 'Stories, images and videos of small adventure trips in and around the state of Idaho',
    url,
    postAlias: 'Adventure',
    logo: {
        url: url + '/img/logo-large.png',
        width: 200,
        height: 200
    },
    companyLogo: {
        url: url + '/img/logo-title.png',
        width: 308,
        height: 60
    }
};
