"use strict";

var Format = require('./../format.js');
var Enum = require('./../enum.js');

/**
 * @param {FlickrAPI.SetSummary|Object} api
 * @param {boolean} [timebound = true] Whether item occurred at a point in time
 * @constructor
 */
function MetadataSet(api, timebound)
{
	/** @type {MetadataSet} */
	var _this = this;
	/** @type {String} */
	var _originalTitle = api.title;
	/**
	 * The slug shared by sets in a story
	 * @type {String}
	 **/
	var _groupSlug = null;
	/**
	 * Unique slug for set in a group
	 * @type {String}
	 **/
	var _partSlug = null;

	/** @type {String} */
	this.id = api.id;
	/** @type {String} */
	this.subTitle = null;
	/** @type {String} */
	this.title = null;
	/**
	 * Flickr collection names are applied as set tags
	 * @type {Array.<String>}
	 **/
	this.tags = [];
	/** @type {bool} */
	this.motorcycle = false;

	// fields added by call to addInfo()

	/** @type {String} */
	this.description = null;
	/** @type {Date} */
	this.createdOn = null;
	/** @type {int} */
	this.photoCount = 0;
	/**
	 * @type {String}
	 * @see http://www.flickr.com/services/api/misc.urls.html
	 */
	this.thumbnail = null;
	/**
	 * Whether set pictures occurred at a specific point in time
	 * @type {boolean}
	 */
	this.timebound = (timebound === undefined) || timebound;
	/** @type {String} */
	this.slug = null;
	/** @type {MetadataSet} */
	this.next = null;
	/** @type {MetadataSet} */
	this.previous = null;
	/** @type {int} */
	this.part = 0;
	/** @type {int} */
	this.totalParts = 0;
	/** @type {boolean} */
	this.isGroupStart = false;

	function init()
	{
		var parts = _originalTitle.split(/:\s*/g);

		_this.title = parts[0];

		if (parts.length > 1)
		{
			_this.subTitle = parts[1];
			_groupSlug = Format.slug(_this.title);
			_partSlug = Format.slug(_this.subTitle);
			_this.slug = _groupSlug + '/' + _partSlug;
		}
		else
		{
			_this.slug = Format.slug(_originalTitle);
		}
	}

	this.hasTags = function()
	{
		return _this.tags.length > 0;
	};

	/**
	 * Title and optional subtitle
	 * @returns {string}
	 */
	this.name = function()
	{
		return _this.title + ((_this.isPartial()) ? ': ' + _this.subTitle : '');
	};

	/**
	 * @param {Flickr.SetInfo} info
	 * @see http://www.flickr.com/services/api/misc.urls.html
	 */
	this.addInfo = function(info)
	{
		var d = info.description._content;

		if (d) { d = d.replace(Enum.pattern.video, '').replace(/[\r\n\s]*$/, ''); }

		_this.createdOn = Format.parseTimeStamp(info.date_create);
		_this.photoCount = info.photos;
		_this.description = d;
		// http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
		_this.thumbnail = Format.string('http://farm{0}.staticflickr.com/{1}/{2}_{3}_s.jpg', info.farm, info.server, info.primary, info.secret);
	};

	this.makeGroupStart = function()
	{
		_this.isGroupStart = true;
		_this.slug = _groupSlug;
	};

	/**
	 * Whether set is part of a group
	 * @returns {boolean}
	 */
	this.isPartial = function() { return _this.totalParts > 1; };

	/**
	 * Whether next set is part of the same group
	 * @returns {boolean}
	 */
	this.nextIsPart = function()
	{
		return _this.next != null && _this.title == _this.next.title;
	};

	/**
	 * Whether previous set is part of the same group
	 * @returns {boolean}
	 */
	this.previousIsPart = function()
	{
		return _this.previous != null && _this.title == _this.previous.title;
	};

	/**
	 * Whether additional FlickrAPI details have been loaded for the set
	 * @returns {boolean}
	 */
	this.hasInfo = function() { return _this.createdOn != null; };

	/**
	 * @param {string} id
	 * @returns {boolean}
	 */
	this.hasPhotoID = function(id)
	{
		return false;
	};

	/**
	 * For set titles that looked like part of a story (colon separator) but had no other parts
	 */
	this.ungroup = function()
	{
		_this.title = _originalTitle;
		_this.subTitle = null;
		_this.slug = Format.slug(_originalTitle);
		_this.isGroupStart = false;

		_groupSlug = null;
		_partSlug = null;
	};

	/**
	 * Whether item matches slug
	 * @param {String} slug
	 * @returns {boolean}
	 */
	this.isMatch = function(slug)
	{
		return (_this.slug == slug || (_partSlug != null && slug == _groupSlug + '-' + _partSlug));
	};

	/**
	 * Metadata groups the items belongs to are treated as tags or keywords
	 * @param {String} tag
	 */
	this.addTag = function(tag)
	{
		if (_this.tags.indexOf(tag) == -1)
		{
			_this.tags.push(tag);

			if (Enum.pattern.motorcycle.test(tag))
			{
				_this.motorcycle = true;
				Enum.pattern.motorcycle.lastIndex = 0;
			}
		}
	};

	init();
}

/**
 * Slug is always prefixed by /YYYY/MM/
 * @see http://www.blogger.com/blogger.g?blogID=118459106898417641#allposts
 * @enum {String}
 */
MetadataSet.blogUrl =
{
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
	'three-national-forests-challis': '',
	'three-national-forests-sawtooth': '',
	'three-national-forests-boise': '',
	'troy-days-and-moscow-mountain': 'troy-days-and-moscow-mountain',
	'silver-city': 'first-ride-to-silver-city',
	'wallowa-valley-2010-out-with-bang': '',
	'wallowa-valley-2010-ryan-ride': '',
	'wallowa-valley-2010-being-there': '',
	'wallowa-valley-2010-getting-there': '',
	'tuscarora-going-home': '',
	'tuscarora-in-mountains': '',
	'tuscarora-in-hills': '',
	'tuscarora-town': '',
	'tuscarora-getting-there': '',
	'jump-creek-to-leslie-gulch-part-1': 'jump-creek-and-leslie-gulch',                 // old link
	'jump-creek-to-leslie-gulch-part-2': 'jump-creek-and-leslie-gulch',
	'jump-creek-to-leslie-gulch-part-3': 'jump-creek-and-leslie-gulch',
	'owyhee-rocks-succor-creek': 'jump-creek-and-leslie-gulch',
	'owyhee-rocks-leslie-gulch': 'jump-creek-and-leslie-gulch',
	'owyhee-rocks-jump-creek-canyon': 'jump-creek-and-leslie-gulch',
	'aptly-named-mud-flat-road': 'rain-on-mud-flat-road',
	'sams-memorial-prairie-poker-run': 'mayfield-skull-rock-y-stop',
	'freezing-in-hells-canyon': 'freezing-in-hells-canyon',
	'pilot-sunset-and-jackson-peaks': '',
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
	'paths-around-palouse': '',
	'spelunking-in-danskin': 'spelunking-in-danskin',
	'lucky-peak-with-laura': 'lucky-peak-with-laura',
	'cricket-ridge-ride': 'cricket-ridge-ride',
	'caterpillar-ridge-ride': 'spring-caterpillars-on-the-boise-ridge'
};

module.exports = MetadataSet;