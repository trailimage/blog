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
 * @type {String}
 */
Post.prototype.icon;

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