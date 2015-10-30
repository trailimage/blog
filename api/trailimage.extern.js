// Post -----------------------------------------------------------------------

/**
 * @constructor
 */
Post = {};

/**
 * @type {String}
 */
Post.prototype.id;

/**
 * @type {String}
 */
Post.prototype.slug;

/**
 * @type {String}
 */
Post.prototype.seriesSlug;

/**
 * @type {String}
 */
Post.prototype.partSlug;

/**
 * @type {String}
 */
Post.prototype.title;

/**
 * @type {String}
 */
Post.prototype.subTitle;

/**
 * @type {String}
 */
Post.prototype.dateTaken;

/**
 * @type {Date}
 */
Post.prototype.createdOn;

/**
 * @type {Date}
 */
Post.prototype.updatedOn;

/**
 * @type {String}
 */
Post.prototype.icon;

/**
 * @type {Flickr.PhotoSummary}
 */
Post.prototype.thumb;

/**
 * @type {String}
 */
Post.prototype.bigThumb;

/**
 * @type {String}
 */
Post.prototype.smallThumb;

/**
 * @type {Integer}
 */
Post.prototype.part;

/**
 * @type {Integer}
 */
Post.prototype.totalParts;

/**
 * @type {Boolean}
 */
Post.prototype.isPartial;

/**
 * @type {Boolean}
 */
Post.prototype.previousIsPart;

/**
 * @type {Boolean}
 */
Post.prototype.nextIsPart;

/**
 * @type {String}
 */
Post.prototype.description;

/**
 * @type {Boolean}
 */
Post.prototype.chronological;

/**
 * @type {Boolean}
 */
Post.prototype.isSeriesStart;

/**
 * @type {Post}
 */
Post.prototype.next;

/**
 * @type {Post}
 */
Post.prototype.previous;

/**
 * @type {Boolean}
 */
Post.prototype.photosLoaded;

/**
 * @type {Integer}
 */
Post.prototype.photoCount;

/**
 * @type {String}
 */
Post.prototype.photoCoordinates;

// Photo Tag ------------------------------------------------------------------

/**
 * @constructor
 */
var PhotoTag = {};

/**
 * @type {String}
 */
PhotoTag.prototype.key;

/**
 * @type {function} callback
 */
PhotoTag.prototype.reload = function(callback) {};

/**
 * @type {function} callback
 */
PhotoTag.prototype.load = function(callback) {};


// Library --------------------------------------------------------------------

/**
 * @constructor
 */
Library = {};

/**
 * @type {String}
 */
Library.prototype.key;

/**
 * @type {Map.<String, PostTag>}
 */
Library.prototype.tags;

/**
 * @type {Map.<Number, Post>}
 */
Library.prototype.posts;

/**
 * @type {Map.<String, String>}
 */
Library.prototype.photoTags;

/**
 * @type {boolean}
 */
Library.prototype.postInfoLoaded;