var TrailImage = {};

/**
 * @type {Object.<TrailImage.Tag[]>}
 */
TrailImage.prototype.menu = {};

/**
 * @type {Object.<TrailImage.Post[]>}
 */
TrailImage.prototype.post = {};

// Post -----------------------------------------------------------------------

/**
 * @type {Object}
 */
TrailImage.prototype.Post;

/**
 * @type {String}
 */
TrailImage.Post.prototype.slug;

/**
 * @type {String}
 */
TrailImage.Post.prototype.title;

/**
 * @type {String}
 */
TrailImage.Post.prototype.subTitle;

/**
 * @type {String}
 */
TrailImage.Post.prototype.icon;

/**
 * @type {Integer}
 */
TrailImage.Post.prototype.part;

/**
 * @type {String}
 */
TrailImage.Post.prototype.description;

// Tag ------------------------------------------------------------------------

/**
 * @type {Object}
 */
TrailImage.prototype.Tag = {};

/**
 * @type {String}
 */
TrailImage.Tag.prototype.title;

/**
 * @type {String}
 */
TrailImage.Tag.prototype.description;

/**
 * @type {String[]}
 */
TrailImage.Tag.prototype.posts;

