const C = require('./constants');
const domain = 'trailimage.com';
const isProduction = process.env['NODE_ENV'] === 'production';
// preferred display sizes
const sizes = {
   thumb: C.flickrSize.SQUARE_150,
   preview: C.flickrSize.SMALL_320,
   normal: [C.flickrSize.LARGE_1024, C.flickrSize.MEDIUM_800, C.flickrSize.MEDIUM_640],
   big: [C.flickrSize.LARGE_2048, C.flickrSize.LARGE_1600, C.flickrSize.LARGE_1024]
};

/**
 * Return environment value or throw an error if it isn't found
 * @param {string} key
 * @returns {string}
 */
function env(key) {
   const value = process.env[key];
   if (value === undefined) { throw new Error(`Environment value ${key} must be set`); }
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

module.exports = {
   env,
   domain,
   /** @type {boolean} */
   get needsAuth() {
      const f = this.flickr.auth.token.access;
      const g = this.google.auth.token.access;
      return f === null || f === '' || g === null || g === '';
   },
   proxy: process.env['HTTPS_PROXY'],
   timestamp: new Date().getTime(),
   isProduction: isProduction,
   // whether to use wwwhisper authentication (https://devcenter.heroku.com/articles/wwwhisper)
   usePersona: process.env['WWWHISPER_DISABLE'] !== '1',
   // hours difference from GMT during standard (not daylight savings) time
   timeZone: -7,
   repoUrl: null,
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
   cache: {
      setAll(enabled) {
         this.views = enabled;
         this.maps = enabled;
         this.json = enabled;
      },
      // whether to cache views
      views: isProduction,
      // whether to cache GeoJSON
      maps: true,
      // whether to cache API JSON
      json: isProduction
   },
   contactLink: `<a href="mailto:${owner.email}">Contact</a>`,
   log: {
      ipLookupUrl: 'http://www.ip-tracker.org/locator/ip-lookup.php?ip=',
      photoUrl: 'http://flickr.com/photo.gne?id=',
      targets: isProduction ? [C.logTo.REDIS, C.logTo.CONSOLE] : [C.logTo.CONSOLE],
      save: isProduction
   },
   style: {
      icon: {
         // decorate haikus with icon
         haiku: C.icon.leaf,
         // match post tag names to Material icons (https://material.io/icons/)
         category: {
            Who: 'person',
            What: 'directions',
            When: 'date_range',
            Where: 'map',
            default: C.icon.tag
         },
         // assign mode of transportation icon based on post tags
         post: {
            motorcycle: /(KTM|BMW|Honda)/gi,
            bicycle: /bicycle/gi,
            hike: /hike/gi,
            jeep: /jeep/gi
         },
         // default transportation mode if none given
         postDefault: 'motorcycle'
      },
      map: {
         // maximum pixel height of static maps displayed with post summaries
         maxInlineHeight: 200
      },
      css: {
         // see category-page.less
         categoryHeader: 'category-header'
      },
      // characters used between displayed title and subtitle
      subtitleSeparator: ':'
   },
   library: {
      // characters separating title and subtitle in library source
      // posts with different subtitles but the same title are considered parts of a series
      subtitleSeparator: ':',
      // photo EXIF is only shown for named artists
      artistNames: ['Abbott', 'Wright', 'Bowman', 'Thomas', 'Reed'],
      // root category displayed on home page
      defaultCategory: 'When'
   },
   map: {
      minimumTrackLength: 0.2,
      minimumTrackPoints: 5,
      // distance a track point must deviate from others to avoid Douglas-Peucker simplification
      maxPointDeviationFeet: 0.5,
      // manually adjusted tracks may have infinite speeds between points so throw out anything over a threshold
      maxPossibleSpeed: 150,
      // erase tracks around given latitude and longitude
      privacyCenter: null,  // reverse order from Google map listing
      privacyMiles: 1,
      checkPrivacy: false,
      // whether track GPX files can be downloaded
      allowDownload: true,
      // maximum number of photo markers to show on Google static map
      // max URL is 2048; 160 is used for base URL; each coordinate needs about 26 characters
      maxMarkers: 70
   },
   bing: {
      key: process.env['BING_KEY']
   },
   cacheDuration: C.time.DAY * 2,
   retryDelay: C.time.SECOND * 30,
   referralSpam: {
      updateFrequency: 0,
      listUrl: 'https://raw.githubusercontent.com/piwik/referrer-spam-blacklist/master/spammers.txt'
   },
   // https://developers.facebook.com/docs/reference/plugins/like/
   // https://developers.facebook.com/apps/110860435668134/summary
   facebook: {
      appID: '110860435668134',
      pageID: '241863632579825',
      siteID: '578261855525416',
      adminID: '1332883594',
      enabled: true,
      authorURL: 'https://www.facebook.com/jason.e.abbott'
   },
   flickr: {
      userID: '60950751@N04',
      appID: '72157631007435048',
      featureSets: [
         { id: '72157632729508554', title: 'Ruminations' }
      ],
      sizes,
      // sizes that must be retrieved for certain contexts
      photoSize: {
         post: sizes.normal.concat(sizes.big, sizes.preview),
         map: [C.flickrSize.SMALL_320],
         search: [C.flickrSize.SQUARE_150]
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
            secret: process.env['FLICKR_TOKEN_SECRET']
         }
      }
   },
   mapbox: {
      accessToken: env('MAPBOX_ACCESS_TOKEN'),
      style: {
         /** style used for interactive maps */
         dynamic: 'jabbott7/cj1qniq9r00322sqxt3pastcf',
         /** style used for stati maps */
         static: 'mapbox/outdoors-v10'
      }
   },
   redis: {
      url: env('REDISCLOUD_URL')
   },
   // http://code.google.com/apis/console/#project:1033232213688
   // http://developers.google.com/maps/documentation/staticmaps/
   google: {
      apiKey: process.env['GOOGLE_KEY'],
      projectID: '316480757902',
      analyticsID: '22180727',        // shown as 'UA-22180727-1
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
   },
   // maintain redirects to support previously used URLs
   redirects: {
      'brother-rider-2013-a-night-in-pierce': 'brother-ride-2013',
      'backroads-to-college': 'panhandle-past-and-future',
      'owyhee-snow-and-sands-uplands': 'owyhee-snow-and-sand'
   },
   // support for renamed photo tags
   photoTagChanges: {
      jeremy: 'jeremyabbott',
      jessica: 'jessicaabbott',
      jime: 'jimeldredge'
   },
   blog: {
      domain: 'trailimage.blogspot.com',
      // match old blog URLs to new
      // slug is always prefixed by /YYYY/MM/
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
         'jump-creek-to-leslie-gulch-part-1': 'jump-creek-and-leslie-gulch',                 // old link
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
         'three-brothers-three-days-three-loops': 'brother-ride-2008/cold-ride-home',        // old link
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