'use strict';
/**
 * Handlebars templates
 * @module
 * @alias Blog.template
 */

/**
 * @alias Blog.template.layout
 */
exports.layout = {
	main: 'layouts/default-layout',
	none: null
};

/**
 * @alias Blog.template.page
 */
exports.page = {
	notFound: 'error/404',
	internalError: 'error/500',
	error: '503',
	about: 'about',
	administration: 'admin',
	authorize: 'authorize',
	exif: 'exif',
	tagMenu: 'tag-menu',
	postMenuData: 'post-menu-data',
	mobileMenuData: 'mobile-menu-data',
	post: 'post',
	postTag: 'post-tag',
	postTagCategory: 'post-tag-category',
	photoTag: 'photo-tag',
	photoSearch: 'photo-search',
	map: 'map',
	search: 'search',
	sitemap: 'sitemap-xml'
};

/**
 * @param {ExpressHbs} hbs
 */
exports.assignHelpers = function(hbs) {
	const Blog = require('./');
	let format = Blog.format;
	let helpers = {
		formatCaption: text => format.story(text),
		formatTitle: text => format.typography(text),
		lowerCase: text => text.toLocaleLowerCase(),
		add: (a, b) => (a * 1) + b,
		date: d => format.date(d),
		subtract: (a, b) => (a * 1) - b,
		plural: count => (count > 1) ? 's' : '', //makeSlug: text => exports.slug(text),
		makeTagList: list => format.tagList(list),
		formatLogTime: text => format.logTime(text),
		/** @type {Date} d */
		formatISO8601: d => d.toISOString(),
		formatFraction: text => format.fraction(text),
		mapHeight: (width, height) => height > width ? config.style.map.maxInlineHeight : height,
		icon: name => format.icon(name),
		iconForPostTag: title => format.postTagIcon(title),
		modeIconForPost: tags => format.postModeIcon(tags),
		rot13: text => format.rot13(text),
		encode: text => encodeURIComponent(text)
	};

	for (let name in helpers) { hbs.registerHelper(name, helpers[name]); }
};