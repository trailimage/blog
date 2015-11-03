'use strict';

const format = require('../format.js');

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
	 * Load photos and info for all posts
	 * @param {DataBase} db
	 * @param {Function} callback
	 */
	loadPhotos(db, callback) {
		let pending = this.posts.length;

		for (let p of this.posts) {
			db.loadPostPhotos(p, post => {
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