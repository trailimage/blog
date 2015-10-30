'use strict';

const format = require('./../format.js');

/**
 *  Collection of posts
 */
class PostTag {
	constructor() {
		/** @type {String} */
		this.title = null;
		/** @type {String} */
		this.slug = null;
		/** @type {String} */
		this.icon = null;
		/** @type {PostTag[]} */
		this.tags = [];
		/** @type {Post[]} */
		this.posts = [];
	}

	/**
	 * Convert Flickr collection into a post tag
	 * @param {Flickr.Collection} collection
	 * @return {PostTag}
	 */
	static parse(collection) {
		let pt = new PostTag();
		pt.title = collection.title;
		pt.slug = format.slug(collection.title);
		pt.icon = PostTag.inferIcon(collection.title);
		pt.tags = [];
		pt.posts = [];
		return pt;
	}

	/**
	 * Load photos and info for all posts
	 * @param {Function} callback
	 */
	loadPhotos(callback) {
		const db = require('../db.js');
		let pending = this.posts.length;

		for (let p of this.posts) {
			db.updatePostPhotos(post => {
				if (--pending <= 0) { callback(); }
			});
		}
	};

	/**
	 * Find child tag with name or slug
	 * @param {String} slug
	 * @return {PostTag}
	 */
	child(slug) {
		for (let t of this.tags) {
			if (t.title === slug || t.slug === slug) { return t; }
		}
		return null;
	};

	/**
	 * @param {String} name
	 * @returns {boolean}
	 */
	hasChild(name) { return this.child(name) !== null; }

	/**
	 * @param {String} title
	 * @returns {string}
	 * @see http://getbootstrap.com/components/
	 */
	static inferIcon(title) {
		switch (title) {
			case 'Who': return 'user';
			case 'What': return 'road';
			case 'When': return 'calendar';
			case 'Where': return 'globe';
			default: return 'tag';
		}
	}
}

module.exports = PostTag;