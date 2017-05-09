"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mapsource_1 = require("./mapsource");
const constants_1 = require("./constants");
const domain = 'trailimage.com';
const isProduction = process.env['NODE_ENV'] === 'production';
const sizes = {
    thumb: constants_1.flickrSize.SQUARE_150,
    preview: constants_1.flickrSize.SMALL_320,
    normal: [constants_1.flickrSize.LARGE_1024, constants_1.flickrSize.MEDIUM_800, constants_1.flickrSize.MEDIUM_640],
    big: [constants_1.flickrSize.LARGE_2048, constants_1.flickrSize.LARGE_1600, constants_1.flickrSize.LARGE_1024]
};
function env(key) {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment value ${key} must be set`);
    }
    return value;
}
const owner = {
    name: 'Jason Abbott',
    image: {
        url: 'http://www.trailimage.com/img/face4_300px.jpg',
        width: 300,
        height: 300
    },
    email: process.env['EMAIL_CONTACT'],
    urls: [
        'https://www.facebook.com/jason.e.abbott',
        'http://www.flickr.com/photos/boise',
        'https://www.youtube.com/user/trailimage',
        'https://twitter.com/trailimage'
    ]
};
const flickr = {
    userID: '60950751@N04',
    appID: '72157631007435048',
    featureSets: [
        { id: '72157632729508554', title: 'Ruminations' }
    ],
    sizes,
    photoSize: {
        post: sizes.normal.concat(sizes.big, sizes.preview),
        map: [constants_1.flickrSize.SMALL_320],
        search: [constants_1.flickrSize.SQUARE_150]
    },
    excludeSets: ['72157631638576162'],
    excludeTags: ['Idaho', 'United States of America', 'Abbott', 'LensTagger', 'Boise'],
    maxRetries: 10,
    retryDelay: 300,
    auth: {
        apiKey: env('FLICKR_API_KEY'),
        secret: env('FLICKR_SECRET'),
        callback: 'http://www.' + domain + '/auth/flickr',
        token: {
            access: process.env['FLICKR_ACCESS_TOKEN'],
            secret: process.env['FLICKR_TOKEN_SECRET'],
            request: null
        }
    }
};
const google = {
    apiKey: process.env['GOOGLE_KEY'],
    projectID: '316480757902',
    analyticsID: '22180727',
    searchEngineID: process.env['GOOGLE_SEARCH_ID'],
    blogID: '118459106898417641',
    drive: {
        apiKey: env('GOOGLE_DRIVE_KEY'),
        tracksFolder: '0B0lgcM9JCuSbMWluNjE4LVJtZWM'
    },
    auth: {
        clientID: env('GOOGLE_CLIENT_ID'),
        secret: env('GOOGLE_SECRET'),
        callback: 'http://www.' + domain + '/auth/google',
        token: {
            type: null,
            access: process.env['GOOGLE_ACCESS_TOKEN'],
            accessExpiration: null,
            refresh: process.env['GOOGLE_REFRESH_TOKEN']
        }
    }
};
exports.library = {
    subtitleSeparator: ':',
    artistNames: ['Abbott', 'Wright', 'Bowman', 'Thomas', 'Reed'],
    defaultCategory: 'When'
};
exports.map = {
    minimumTrackLength: 0.2,
    minimumTrackPoints: 5,
    maxPointDeviationFeet: 0.5,
    maxPossibleSpeed: 150,
    privacyCenter: null,
    privacyMiles: 1,
    checkPrivacy: false,
    allowDownload: true,
    maxMarkers: 70,
    link: {
        googleEarth: 'https://earth.google.com/web/@{lat},{lon},1100a,{altitude}d,35y,0h,0t,0r',
        gaiaGPS: 'https://www.gaiagps.com/map/?layer=GaiaTopoRasterFeet&lat={lat}&lon={lon}&zoom={zoom}'
    },
    source: mapsource_1.default
};
exports.default = {
    env,
    domain,
    get needsAuth() {
        const f = flickr.auth.token.access;
        const g = google.auth.token.access;
        return f === null || f === '' || g === null || g === '';
    },
    proxy: process.env['HTTPS_PROXY'],
    timestamp: new Date().getTime(),
    testing: false,
    isProduction: isProduction,
    usePersona: process.env['WWWHISPER_DISABLE'] !== '1',
    timeZone: -7,
    repoUrl: 'https://github.com/Jason-Abbott/trail-image.git',
    owner,
    site: {
        domain,
        title: 'Trail Image',
        subtitle: 'Adventure Photography by ' + owner.name,
        description: 'Stories, images and videos of small adventure trips in and around the state of Idaho',
        url: 'http://www.trailimage.com',
        postAlias: 'Adventure',
        logo: {
            url: 'http://www.' + domain + '/img/logo-large.png',
            width: 200,
            height: 200
        },
        companyLogo: {
            url: 'http://www.' + domain + '/img/logo-title.png',
            width: 308,
            height: 60
        }
    },
    library: exports.library,
    cache: {
        setAll(enabled) {
            this.views = enabled;
            this.maps = enabled;
            this.json = enabled;
        },
        views: isProduction,
        maps: true,
        json: isProduction
    },
    contactLink: `<a href="mailto:${owner.email}">Contact</a>`,
    log: {
        ipLookupUrl: 'http://www.ip-tracker.org/locator/ip-lookup.php?ip=',
        photoUrl: 'http://flickr.com/photo.gne?id=',
        targets: isProduction ? [constants_1.logTo.REDIS, constants_1.logTo.CONSOLE] : [constants_1.logTo.CONSOLE],
        save: isProduction
    },
    style: {
        icon: {
            category: {
                Who: 'person',
                What: 'directions',
                When: 'date_range',
                Where: 'map',
                default: 'local_offer'
            },
            post: {
                motorcycle: /(KTM|BMW|Honda)/gi,
                bicycle: /bicycle/gi,
                hike: /hike/gi,
                jeep: /jeep/gi
            },
            postDefault: 'motorcycle'
        },
        map: {
            maxInlineHeight: 200
        },
        css: {
            categoryHeader: 'category-header'
        },
        subtitleSeparator: ':'
    },
    map: exports.map,
    bing: {
        key: process.env['BING_KEY']
    },
    cacheDuration: constants_1.time.DAY * 2,
    retryDelay: constants_1.time.SECOND * 30,
    referralSpam: {
        updateFrequency: 0,
        listUrl: 'https://raw.githubusercontent.com/piwik/referrer-spam-blacklist/master/spammers.txt'
    },
    facebook: {
        appID: '110860435668134',
        pageID: '241863632579825',
        siteID: '578261855525416',
        adminID: '1332883594',
        enabled: true,
        authorURL: 'https://www.facebook.com/jason.e.abbott'
    },
    flickr,
    mapbox: {
        accessToken: env('MAPBOX_ACCESS_TOKEN'),
        style: {
            dynamic: 'jabbott7/cj1qniq9r00322sqxt3pastcf',
            static: 'jabbott7/cj1prg25g002o2ro2xtzos6cy'
        }
    },
    redis: {
        url: env('REDISCLOUD_URL')
    },
    google,
    redirects: {
        'brother-rider-2013-a-night-in-pierce': 'brother-ride-2013',
        'backroads-to-college': 'panhandle-past-and-future',
        'owyhee-snow-and-sands-uplands': 'owyhee-snow-and-sand'
    },
    photoTagChanges: {
        jeremy: 'jeremyabbott',
        jessica: 'jessicaabbott',
        jime: 'jimeldredge'
    },
    blog: {
        domain: 'trailimage.blogspot.com',
        redirects: {
            'juntura-by-desert-dry-creek-gorge': 'juntura-by-desert',
            'juntura-by-desert-owyhee-dam': 'juntura-by-desert',
            'eastern-oregon-club-ride-jordan-craters': 'klr-club-in-the-owyhees',
            'eastern-oregon-club-ride-leslie-gulch': 'klr-club-in-the-owyhees',
            'eastern-oregon-club-ride-lake-owyhee': 'klr-club-in-the-owyhees',
            'autumn-lowman-loop-going-home': 'wintry-backroads-to-lowman',
            'autumn-lowman-loop-overnight': 'wintry-backroads-to-lowman',
            'autumn-lowman-loop-lunch-and-museum': 'wintry-backroads-to-lowman',
            'autumn-lowman-loop-over-hills': 'wintry-backroads-to-lowman',
            'st-joe-hidden-trails-day-5': 'brother-ride-2011/bailout-to-benewah',
            'st-joes-hidden-trails-day-4': 'brother-ride-2011/bailout-to-benewah',
            'st-joe-hidden-trails-day-3': 'brother-ride-2011/exercise-and-elsie-lake',
            'st-joes-hidden-trails-day-2': 'brother-ride-2011/tunnels-to-loop-creek',
            'st-joes-hidden-trails-day-1': 'brother-ride-2011',
            'edge-of-hells-canyon-oregon-side': 'hat-point-above-hells-canyon',
            'edge-of-hells-canyon-from-idaho': 'hat-point-above-hells-canyon',
            'up-to-wazzu-palouse-ohv': 'backroads-to-college',
            'up-to-wazzu-scenic-route': 'backroads-to-college',
            'danskin-with-hunter': 'stalled-in-willow-creek',
            'bruneau-dune-sands-of-time': 'grandma-on-the-big-dune',
            'zeno-loop-petroglyphs': 'zeno-falls-on-ben',
            'zeno-loop-falls': 'zeno-falls-on-ben',
            'zeno-loop-homestead': 'zeno-falls-on-ben',
            'zeno-loop-shoo-fly': 'zeno-falls-on-ben',
            'swan-falls-but-once-birds-of-prey': 'swan-falls-but-once',
            'swan-falls-but-once-to-snake': 'swan-falls-but-once',
            'zeno-canyon-ride-not-taken': '',
            'hells-canyon-2010-out-with-bang': 'wallowa-valley-rally/out-with-a-bang',
            'hells-canyon-2010-ryan-ride': 'wallowa-valley-rally/ryan-ride',
            'hells-canyon-2010-being-there': 'wallowa-valley-rally/being-there',
            'hells-canyon-2010-getting-there': 'wallowa-valley-rally',
            'indian-hot-springs-leaving-there': 'indian-hot-springs',
            'indian-hot-springs-being-there': 'indian-hot-springs',
            'indian-hot-springs-getting-there': 'indian-hot-springs',
            'louie-lake-resplendent-road': 'sleeping-on-the-shore-of-louie-lake',
            'louie-lake-troublesome-trail': 'sleeping-on-the-shore-of-louie-lake',
            'lolo-motorway-and-more-day-4': 'brother-ride-2010/two-breakdowns',
            'lolo-motorway-and-more-day-3': 'brother-ride-2010/thundersnow',
            'lolo-motorway-and-more-day-2': 'brother-ride-2010/cayuse-creek',
            'lolo-motorway-and-more-day-1': 'brother-ride-2010',
            'hunter-meets-captain-bonneville': 'meeting-captain-bonneville',
            'three-national-forests-challis': 'three-national-forests/challis',
            'three-national-forests-sawtooth': 'three-national-forests/sawtooth',
            'three-national-forests-boise': 'three-national-forests',
            'troy-days-and-moscow-mountain': 'troy-days-and-moscow-mountain',
            'silver-city': 'first-ride-to-silver-city',
            'wallowa-valley-2010-out-with-bang': 'wallowa-valley-rally/out-with-a-bang',
            'wallowa-valley-2010-ryan-ride': 'wallowa-valley-rally/ryan-ride',
            'wallowa-valley-2010-being-there': 'wallowa-valley-rally/being-there',
            'wallowa-valley-2010-getting-there': 'wallowa-valley-rally',
            'tuscarora-going-home': 'making-art-in-tuscarora/going-home',
            'tuscarora-in-mountains': 'making-art-in-tuscarora/in-the-mountains',
            'tuscarora-in-hills': 'making-art-in-tuscarora/in-the-hills',
            'tuscarora-town': 'making-art-in-tuscarora/the-town',
            'tuscarora-getting-there': 'making-art-in-tuscarora',
            'jump-creek-to-leslie-gulch-part-1': 'jump-creek-and-leslie-gulch',
            'jump-creek-to-leslie-gulch-part-2': 'jump-creek-and-leslie-gulch',
            'jump-creek-to-leslie-gulch-part-3': 'jump-creek-and-leslie-gulch',
            'owyhee-rocks-succor-creek': 'jump-creek-and-leslie-gulch',
            'owyhee-rocks-leslie-gulch': 'jump-creek-and-leslie-gulch',
            'owyhee-rocks-jump-creek-canyon': 'jump-creek-and-leslie-gulch',
            'aptly-named-mud-flat-road': 'rain-on-mud-flat-road',
            'sams-memorial-prairie-poker-run': 'mayfield-skull-rock-y-stop',
            'freezing-in-hells-canyon': 'freezing-in-hells-canyon',
            'pilot-sunset-and-jackson-peaks': 'one-day-three-peaks',
            'lost-lake-crawdads-of-st-joe-day-4': 'brother-ride-2009/crater-peak-reunion',
            'lost-lake-crawdads-of-st-joe-day-3': 'brother-ride-2009/rain-in-avery',
            'lost-lake-crawdads-of-st-joe-day-2': 'brother-ride-2009/lost-lake-crawdads',
            'lost-lake-crawdads-of-st-joe-day-1': 'brother-ride-2009',
            'circumnavigating-oahu': 'circumnavigating-oahu',
            'boise-ridge-with-boy': 'boise-ridge-with-the-boy',
            'three-brothers-three-days-three-loops': 'brother-ride-2008/cold-ride-home',
            'three-loops-in-st-joe-day-3': 'brother-ride-2008/cold-ride-home',
            'three-loops-in-st-joe-day-2': 'brother-ride-2008/camping-with-cows',
            'three-loops-in-st-joe-day-1': 'brother-ride-2008',
            'to-trinity-and-beyond': 'lunch-at-trinity-lookout',
            'unholy-trinity': 'unholy-trinity',
            'my-eye-my-eye-she-screamed': 'bad-day-at-danskin',
            'thorn-creek-butte-scenic-route': 'arrowrock-to-thorn-creek-butte',
            'paths-around-palouse': 'troy-days-beers-and-bears',
            'spelunking-in-danskin': 'spelunking-in-danskin',
            'lucky-peak-with-laura': 'lucky-peak-with-laura',
            'cricket-ridge-ride': 'cricket-ridge-ride',
            'caterpillar-ridge-ride': 'spring-caterpillars-on-the-boise-ridge'
        }
    },
    alwaysKeywords: 'Adventure, Scenery, Photography,',
    keywords: 'BMW R1200GS, KTM XCW, jeep wrangler, motorcycle, motorcycling, riding, adventure, Jason Abbott, Abbott, outdoors, scenery, idaho, mountains'
};
//# sourceMappingURL=config.js.map