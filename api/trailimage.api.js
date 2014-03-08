/**
 * @type {Object.<menu.Tag[]>}
 */
var menu = {};

// Post -----------------------------------------------------------------------

/**
 * @type {Object}
 */
menu.prototype.Post;

/**
 * @type {String}
 */
menu.Post.prototype.slug;

/**
 * @type {String}
 */
menu.Post.prototype.title;

/**
 * @type {String}
 */
menu.Post.prototype.subTitle;

/**
 * @type {String}
 */
menu.Post.prototype.icon;

/**
 * @type {Integer}
 */
menu.Post.prototype.part;

/**
 * @type {String}
 */
menu.Post.prototype.description;

// Tag ------------------------------------------------------------------------

/**
 * @type {Object}
 */
menu.prototype.Tag = {};

/**
 * @type {String}
 */
menu.Tag.prototype.title;

/**
 * @type {String}
 */
menu.Tag.prototype.description;

/**
 * @type {menu.Post[]}
 */
menu.Tag.prototype.items;

