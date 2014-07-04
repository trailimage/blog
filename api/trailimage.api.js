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

// Tag ------------------------------------------------------------------------

/**
 * @constructor
 */
Tag = {}

/**
 * @type {String}
 */
Tag.prototype.title;

/**
 * @type {String}
 */
Tag.prototype.description;

/**
 * @type {String[]}
 */
Tag.prototype.posts;

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
 * @type {Object.<Tag>}
 */
Library.prototype.tags;

/**
 * @type {Post[]}
 */
Library.prototype.posts;

/**
 * @type {Object.<String>}
 */
Library.prototype.photoTags;

/**
 * @type {boolean}
 */
Library.prototype.postInfoLoaded;