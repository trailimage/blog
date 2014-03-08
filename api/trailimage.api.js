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
menu.Post.prototype.icon;

/**
 * @type {Integer}
 */
menu.Post.prototype.part;

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
 * @type {menu.Post[]}
 */
menu.Tag.prototype.items;

