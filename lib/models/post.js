"use strict";

var format = require('./../format.js');
var setting = require('./../settings.js');
var library = require('./../models/library.js');
var Enum = require('./../enum.js');
var log = require('winston');

function Post() {
	this.id = null;
	/** @type {String} */
	this.originalTitle = null;
	/** @type {String} */
	this.dateTaken = null;
	/** @type {Object.<int>} */
	this.video = null;
	/** @type {Flickr.PhotoSummary[]} */
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
	/** @type {String} */
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
	/** @type {Boolean} */
	this.photosLoaded = false;
	/** @type {String} */
	this.description = null;
	/** @type {String} */
	this.longDescription = null;
	/** @type {Date} */
	this.createdOn = null;
	/** @type {Date} */
	this.updatedOn = null;

	/** @type {int} */
	this.photoCount = 0;
	/**
	 * @type {String}
	 * @see http =//www.flickr.com/services/api/misc.urls.html
	 */
	this.bigThumb = null;
	this.smallThumb = null;
	/** @type {Flickr.PhotoSummary[]} */
	this.thumb = null;
	/**
	 * Whether set pictures occurred at a specific point in time
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
	/** @type {Boolean} */
	this.isPartial = false;
	/** @type {Boolean} */
	this.nextIsPart = false;
	/** @type {Boolean} */
	this.previousIsPart = false;
	/** @type {int} */
	this.totalParts = 0;
	/** @type {boolean} */
	this.isSeriesStart = false;
}

/**
 * Whether post has tags
 * @returns {boolean}
 */
Post.prototype.hasTags = function() { return this.tags.length > 0; };

/**
 * Title and optional subtitle
 * @returns {string}
 */
Post.prototype.name = function() {
	// context is screwed up when called from HBS template
	var p = (this instanceof Post) ? this : this.post;
	return p.title + ((p.isPartial) ? ': ' + p.subTitle : '');
};

/**
 * Add additional post information
 * @param {Flickr.SetInfo} info
 * @see http://www.flickr.com/services/api/misc.urls.html
 */
Post.prototype.addInfo = function(info) {
	// info will be null if Flickr service is down
	if (info == null) { return; }

	this.video = parseVideoMetadata(info);      // may also update info.description
	this.createdOn = format.parseTimeStamp(info.date_create);
	this.updatedOn = format.parseTimeStamp(info.date_update);
	this.photoCount = info.photos;
	this.description = this.longDescription = info.description._content.replace(/[\r\n]/g, '');
	// http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
	// http://farm{{info.farm}}.static.flickr.com/{{info.server}}/{{info.primary}}_{{info.secret}}.jpg'
	var thumb = `http://farm${info.farm}.staticflickr.com/${info.server}/${info.primary}_${info.secret}`;

	this.bigThumb = thumb + '.jpg';     // 500px
	this.smallThumb = thumb + '_s.jpg';

	this.infoLoaded = true;
};

/**
 * Remove post details to force reload from sources
 */
Post.prototype.removeDetails = function() {
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

/**
 * Load photo details from Flickr
 * @param {function} callback
 */
Post.prototype.getPhotos = function(callback) {
	if (this.photosLoaded && this.infoLoaded) {
		callback();
	} else {
		let flickr = require('../adapters/flickr.js');
		let p = this;
		/**
		 * Photo sizes to retrieve from Flickr API
		 * @type {String[]}
		 */
		const sizes = [
			flickr.size.small240,       // thumbnail preview
			flickr.size.small320,
			flickr.size.medium500,
			flickr.size.medium640,      // some older image have no size larger than 640x480
			flickr.size.medium800,
			flickr.size.large1024,      // default size
			flickr.size.large2048       // enlarged size
		];

		flickr.getSet(p.id, sizes, !p.infoLoaded, function(photos, info) {
			if (photos != null) {
				if (!p.infoLoaded) { p.addInfo(info); }

				p.photos = photos.photo;
				p.photoTagList = parsePhotoTags(photos);

				for (let i = 0; i < p.photos.length; i++) {
					if (parseInt(p.photos[i].isprimary)) { p.thumb = p.photos[i]; break; }
				}

				if (p.id != setting.flickr.poemSet && p.id != setting.flickr.featureSet) {
					p.photoCoordinates = getPhotoCoordinates(p.photos);
					p.dateTaken = getDateTaken(p.photos);
					p.longDescription = updateDescription(p.description, p.photos, p.video);
				}
				p.photosLoaded = true;
			}
			callback();
		});
	}
};

Post.prototype.makeSeriesStart = function() {
	this.isSeriesStart = true;
	this.slug = this.seriesSlug;
};

/**
 * For post titles that looked like part of a series (colon separator) but had no other parts
 */
Post.prototype.ungroup = function() {
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
Post.prototype.isMatch = function(slug) {
	return (this.slug == slug || (this.partSlug != null && slug == this.seriesSlug + '-' + this.partSlug));
};

/**
 * Groups the items belong to are treated as tags or keywords
 * @param {String} tag
 */
Post.prototype.addTag = function(tag) {
	if (this.tags.indexOf(tag) == -1) {
		this.tags.push(tag);

		for (let i in exports.mode) {
			if (exports.mode[i].test(tag)) {
				this.mode = i;
				exports.mode[i].lastIndex = 0;
				break;
			}
		}
		if (this.mode == null) { this.mode == 'motorcycle'; }
	}
};

/**
 * Create post from Flickr photo set
 * @param {Flickr.SetSummary|Object} api
 * @param {boolean} [chronological = true] Whether set photos occurred together at a point in time
 * @return {Post}
 */
exports.fromFlickr = function(api, chronological) {
	var p = new Post();

	p.id = api.id;
	p.chronological = (chronological === undefined) || chronological;
	p.originalTitle = api.title;

	var parts = p.originalTitle.split(/:\s*/g);

	p.title = parts[0];

	if (parts.length > 1) {
		p.subTitle = parts[1];
		p.seriesSlug = format.slug(p.title);
		p.partSlug = format.slug(p.subTitle);
		p.slug = p.seriesSlug + '/' + p.partSlug;
	} else {
		p.slug = format.slug(p.originalTitle);
	}
	return p;
};

/**
 * Set mode of transportation icon based on post tag (Flickr set collection)
 * @enum {RegExp}
 */
exports.mode = {
	'motorcycle': /(KTM|BMW|Honda)/gi,
	'bicycle': /bicycle/gi,
	'hike': /hike/gi,
	'jeep': /jeep/gi
};

/**
 * Slug is always prefixed by /YYYY/MM/
 * @see http://www.blogger.com/blogger.g?blogID=118459106898417641#allposts
 * @enum {String}
 */
exports.blogUrl = {
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
	'circumnavigating-oahu': '',
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

/**
 * @param {Flickr.PhotoSummary[]} photos
 * @return {String}
 */
function getPhotoCoordinates(photos) {
	var start = 1;  // always skip first photo
	var total = photos.length;
	var map = '';

	if (total > setting.google.maxMarkers) {
		start = 5;  // skip the first few which are often just prep shots
		total = setting.google.maxMarkers + 5;
		if (total > photos.length) { total = photos.length; }
	}

	for (let i = start; i < total; i++) {
		if (photos[i].latitude) {
			map += '|' + photos[i].latitude + ',' + photos[i].longitude;
		}
	}
	return (format.isEmpty(map)) ? null : encodeURIComponent('size:tiny' + map);
}

/**
 * Get the overall date for the photo set
 * @param {Flickr.PhotoSummary[]} photos
 * @return {String}
 */
function getDateTaken(photos) {
	/** @type {int} */
	var firstDatedPhoto = 2;    // use third photo in case the first few are generated map images

	if (photos.length <= firstDatedPhoto) { firstDatedPhoto = photos.length - 1; }
	return format.date(format.parseDate(photos[firstDatedPhoto].datetaken));
}

/**
 * Get unique list of tags used on photos in the post
 * @param {Flickr.SetPhotos} set
 * @return {String}
 */
function parsePhotoTags(set) {
	/** @type {Flickr.PhotoSummary[]} */
	var photos = set.photo;
	/** @type {String[]} */
	var tags = [];
	/** @type {String[]} */
	var photoTags = [];

	for (let i = 0; i < photos.length; i++) {
		let t = photos[i].tags.split(' ');
		photoTags = [];

		for (let j = 0; j < t.length; j++) {
			var tag = library.photoTags[t[j]];     // lookup original tag name

			if (tag) {
				photoTags.push(tag);
				if (tags.indexOf(tag) == -1) { tags.push(tag); }
			}
		}
		// update tag list with original tag names
		set.photo[i].tags = photoTags.join(', ');
	}
	return (tags.length > 0) ? tags.join(', ') : null;
}

/**
 * Format set description
 * @param {String} description
 * @param {Flickr.PhotoSummary[]} photos
 * @param {Object.<int>} video
 */
function updateDescription(description, photos, video) {
	if (!format.isEmpty(description)) {
		description = `${description} (Includes ${photos.length} photos`;
		description += (video == null) ? '.)' : ' and one video.)'
	}
	return description;
}

/**
 * Get YouTube ID and dimensions for video link
 * @param {Flickr.SetInfo} info
 */
function parseVideoMetadata(info) {
	var video = null;
	var re = Enum.pattern.video;
	/** @type {String} */
	var d = info.description._content;

	if (re.test(d))	{
		re.lastIndex = 0;
		let match = re.exec(d);
		video = {id: match[4], width: match[2], height: match[3]};
		// remove video link from description
		info.description._content = d.replace(match[0], '').replace(/[\r\n\s]*$/, '');
		re.lastIndex = 0;
	}
	return video;
}
