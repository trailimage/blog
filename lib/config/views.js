"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_provider_1 = require("./post-provider");
exports.keywords = [
    'BMW R1200GS',
    'KTM XCW',
    'jeep wrangler',
    'motorcycle',
    'motorcycling',
    'riding',
    'adventure',
    'Jason Abbott',
    'Abbott',
    'outdoors',
    'scenery',
    'idaho',
    'mountains'
];
exports.style = {
    icon: {
        category: {
            Who: 'person',
            What: 'directions',
            When: 'date_range',
            Where: 'map',
            default: 'local_offer'
        },
        mode: {
            motorcycle: /(KTM|BMW|Honda)/gi,
            bicycle: /bicycle/gi,
            hike: /hike/gi,
            jeep: /jeep/gi
        },
        defaultMode: 'motorcycle'
    },
    photoSizes: post_provider_1.sizes,
    map: {
        maxInlineHeight: 200
    },
    css: {
        categoryHeader: 'category-header'
    },
    subtitleSeparator: ':'
};
