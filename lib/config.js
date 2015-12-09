'use strict';

const Enum = require('./enum.js');

/**
 * Return environment value or throw an error if it isn't found
 * @param {String} key
 * @returns {String}
 */
function env(key) {
	let value = process.env[key];
	if (value === undefined) { throw new Error(`Environment value ${key} must be set`); }
	return value;
}

exports.env = env;
/** @type {String} */
exports.proxy = process.env['HTTPS_PROXY'];
/** @type {Number} */
exports.timestamp = new Date().getTime();
/** @type {Boolean} */
exports.isProduction = (process.env['NODE_ENV'] === 'production');
/**
 * Whether to use Persona based wwwhisper authentication
 * @see https://devcenter.heroku.com/articles/wwwhisper
 * @type {Boolean}
 */
exports.usePersona = process.env['WWWHISPER_DISABLE'] !== '1';
/** @type {Boolean} */
exports.cacheOutput = exports.isProduction;
/** @type {number} */
exports.timezone = -6;
/** @type {String} */
exports.contactEmail = 'contact@trailimage.com';
/** @type {String} */
exports.contactLink = `<a href="mailto:${exports.contactEmail}">Contact</a>`;
/** @type {String} */
exports.repoUrl = null;

exports.referralSpam = {
	/**
	 * Source for spam domain list
	 * @type {String}
	 */
	listUrl: 'https://raw.githubusercontent.com/piwik/referrer-spam-blacklist/master/spammers.txt',
	/**
	 * Milliseconds between spam list updates
	 * @type {Number}
	 */
	updateFrequency: Enum.time.day
};

exports.style = {
	/**
	 * Post series are identified as those having a common title with differing subtitles
	 * @type {String}
	 */
	subtitleSeparator: ':',
	/**
	 * Photo EXIF is only shown for named artists
	 * @type {String[]}
	 */
	artistNames: ['Abbott', 'Wright', 'Bowman', 'Thomas', 'Reed']
};

/**
 * @enum {Number|Number[]|Boolean}
 */
exports.map = {
	minimumTrackLength: 0.2,
	minimumTrackPoints: 5,
	/**
	 * Distance a track point must deviate from others to avoid Douglas-Peucker simplification
	 */
	maxDeviationFeet: 0.5,
	/**
	 * Manually adjusted tracks may have infinite speeds between points so throw out anything
	 * over a threshold
	 */
	maxPossibleSpeed: 150,
	/**
	 * Erase tracks around given latitude and longitude
	 * @type {Number[]}
	 */
	privacyCenter: null,  // reverse order from Google map listing
	privacyMiles: 1,
	/**
	 * @type {Boolean}
	 */
	checkPrivacy: false,
	/**
	 * Whether track GPX files can be downloaded
	 * @type {Boolean}
	 */
	allowDownload: true,
	/**
	 * Maximum number of photo markers to show on Google static map
	 * @type {Number}
	 */
	maxMarkers: 70      // max URL is 2048; 160 is used for base URL; each coordinate needs about 26 characters
};

/**
 * @enum {String}
 */
exports.bing = {
	key: process.env['BING_KEY']
};

exports.cacheDuration = Enum.time.day * 2;
exports.retryDelay = Enum.time.second * 30;

/**
 * @enum {string|boolean}
 * @see https://developers.facebook.com/docs/reference/plugins/like/
 * @see https://developers.facebook.com/apps/110860435668134/summary
 */
exports.facebook = {
	appID: '110860435668134',
	pageID: '241863632579825',
	siteID: '578261855525416',
	adminID: '1332883594',
	enabled: true,
	authorURL: 'https://www.facebook.com/jason.e.abbott'
};

/**
 * @see http://code.google.com/apis/console/#project:1033232213688
 * @see http://developers.google.com/maps/documentation/staticmaps/
 * @type {string}
 */
exports.google = {
	apiKey: process.env['GOOGLE_KEY'],
	projectID: '1033232213688',
	analyticsID: '22180727',        // shown as 'UA-22180727-1
	searchEngineID: process.env['GOOGLE_SEARCH_ID'],
	blogID: '118459106898417641'
};

/**
 * Maintain redirects to support previously used URLs
 * @type {Object.<String>}
 * @enum {String}
 */
exports.redirects = {
	'brother-rider-2013-a-night-in-pierce': 'brother-ride-2013',
	'backroads-to-college': 'panhandle-past-and-future',
	'owyhee-snow-and-sands-uplands': 'owyhee-snow-and-sand'
};

/**
 * Match old blog URLs to new
 * Slug is always prefixed by /YYYY/MM/
 * @see http://www.blogger.com/blogger.g?blogID=118459106898417641#allposts
 * @enum {String}
 */
exports.blog = {
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
};

/**
 * @type {string}
 * @const
 */
exports.domain = 'trailimage.com';

/**
 * @type {String}
 * @const
 */
exports.title = 'Trail Image';

/**
 * @type {String}
 * @const
 */
exports.subtitle = 'Adventure Photography by Jason Abbott';

/**
 * @type {String}
 * @const
 */
exports.description = 'Stories, image and videos of small adventure trips in and around the state of Idaho';

/**
 * @type {String}
 * @const
 */
exports.keywords = 'BMW R1200GS, KTM XCW, jeep wrangler, motorcycle, motorcycling, riding, adventure, Jason Abbott, Abbott, outdoors, scenery, idaho, mountains';