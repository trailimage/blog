'use strict';

const is = require('../is.js');
const format = require('../format.js');

class Post {
	constructor() {
		this.id = null;
		/** @type {String} */
		this.originalTitle = null;
		/** @type {String} */
		this.dateTaken = null;
		/** @type {Video} */
		this.video = null;
		/** @type {Photo[]} */
		this.photos = [];
		/**
		 * The slug shared by posts in a series
		 * @type {String}
		 **/
		this.seriesSlug = null;
		/**
		 * Unique slug for one post in a series
		 * @type {String}
		 **/
		this.partSlug = null;
		/**
		 * Part of title after colon for posts that are part of a series
		 * @type {String}
		 */
		this.subTitle = null;
		/** @type {String} */
		this.title = null;
		/**
		 * Flickr collection names are applied as set tags
		 * @type {String[]}
		 **/
		this.tags = [];
		/** @type {String} */
		this.photoTagList = null;
		/** @type {String} Mode of transport for icon display in menu */
		this.mode = null;
		/** @type {String} */
		this.photoCoordinates = null;

		// fields added by call to addInfo()

		/** @type {Boolean} */
		this.infoLoaded = false;
		/**
		 * Photos are lazy loaded
		 * @type {Boolean}
		 */
		this.photosLoaded = false;
		/** @type {String} */
		this.description = null;
		/** @type {String} */
		this.longDescription = null;
		/** @type {Date} */
		this.createdOn = null;
		/** @type {Date} */
		this.updatedOn = null;
		/** @type {Number} */
		this.photoCount = 0;
		/** @type {String} */
		this.bigThumb = null;
		this.smallThumb = null;
		/** @type {Flickr.PhotoSummary[]} */
		this.thumb = null;
		/**
		 * Whether post pictures occurred at a specific point in time
		 * Exceptions are themed sets
		 * @type {boolean}
		 */
		this.chronological = true;
		/** @type {String} */
		this.slug = null;
		/** @type {Post} */
		this.next = null;
		/** @type {Post} */
		this.previous = null;
		/** @type {int} */
		this.part = 0;
		/**
		 * Whether post is part of a series
		 * @type {Boolean}
		 */
		this.isPartial = false;
		/**
		 * Whether next post is part of the same series
		 * @type {Boolean}
		 */
		this.nextIsPart = false;
		/**
		 * Whether previous post is part of the same series
		 * @type {Boolean}
		 */
		this.previousIsPart = false;
		/**
		 * Total number of posts in series, if any
		 * @type {Number}
		 */
		this.totalParts = 0;
		/**
		 * Whether this post begins a series
		 * @type {boolean}
		 */
		this.isSeriesStart = false;
	}

	/**
	 * Map old blog URLs to new paths
	 * @returns {Object.<String>}
	 */
	static get blogUrl() { return blogMap; }

	/**
	 * Whether post has tags
	 * @returns {boolean}
	 */
	get hasTags() { return this.tags.length > 0; }

	/**
	 * Title and optional subtitle
	 * @returns {string}
	 */
	name() {
		// context is screwed up when called from HBS template
		var p = (this instanceof Post) ? this : this.post;
		return p.title + ((p.isPartial) ? ': ' + p.subTitle : '');
		//return this.title + ((this.isPartial) ? ': ' + this.subTitle : '');
	};

	/**
	 * Remove post details to force reload from data provider
	 */
	removeDetails() {
		// from addInfo()
		this.video = null;
		this.createdOn = null;
		this.updatedOn = null;
		this.photoCount = 0;
		this.description = null;
		this.thumb = null;
		this.bigThumb = null;
		this.smallThumb = null;
		this.infoLoaded = false;

		// from getPhotos()
		this.photos = null;
		this.photoTagList = null;
		this.photoCoordinates = null;
		this.longDescription = null;
		this.photosLoaded = false;
	};

	makeSeriesStart() {
		this.isSeriesStart = true;
		this.slug = this.seriesSlug;
	};

	/**
	 * For post titles that looked like part of a series (colon separator) but had no other parts
	 */
	ungroup() {
		this.title = this.originalTitle;
		this.subTitle = null;
		this.slug = format.slug(this.originalTitle);
		this.isSeriesStart = false;
		this.isPartial = false;
		this.nextIsPart = false;
		this.previousIsPart = false;

		this.seriesSlug = null;
		this.partSlug = null;
	};

	/**
	 * Whether item matches slug
	 * @param {String} slug
	 * @returns {boolean}
	 */
	isMatch(slug) {
		return (this.slug == slug || (is.value(this.partSlug) && slug == this.seriesSlug + '-' + this.partSlug));
	}

	/**
	 * Groups the items belong to are treated as tags or keywords
	 * @param {String} t
	 */
	addTag(t) {
		if (this.tags.indexOf(t) == -1) {
			this.tags.push(t);

			for (let i in moveMode) {
				let re = moveMode[i];
				if (re.test(t)) {
					this.mode = i;
					re.lastIndex = 0;
					break;
				}
			}
			if (this.mode === null) { this.mode = 'motorcycle'; }
		}
	};
}

module.exports = Post;

// - Private static members ---------------------------------------------------

/**
 * Set mode of transportation icon based on post tag (Flickr set collection)
 * @enum {RegExp}
 */
const moveMode = {
	motorcycle: /(KTM|BMW|Honda)/gi,
	bicycle: /bicycle/gi,
	hike: /hike/gi,
	jeep: /jeep/gi
};

/**
 * Match old blog URLs to new
 * Slug is always prefixed by /YYYY/MM/
 * @see http://www.blogger.com/blogger.g?blogID=118459106898417641#allposts
 * @enum {String}
 */
const blogMap = {
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
	'wallowa-valley-2010-out-with-bang': '',
	'wallowa-valley-2010-ryan-ride': '',
	'wallowa-valley-2010-being-there': '',
	'wallowa-valley-2010-getting-there': '',
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
};