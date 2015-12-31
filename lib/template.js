'use strict';
/**
 * Handlebars templates
 * @module TI.template
 */

/**
 * @alias TI.template.layout
 */
exports.layout = {
	main: 'layouts/default-layout',
	none: null
};

/**
 * @alias TI.template.page
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