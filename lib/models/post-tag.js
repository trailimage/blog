'use strict';

/**
 *  Collection of posts grouped by a tag
 *  @alias TI.PostTag
 */
class PostTag {
	constructor() {
		/** @type String */
		this.title = null;
		/** @type String */
		this.slug = null;
		/** @type String */
		this.icon = null;
		/** @type TI.PostTag[] */
		this.tags = [];
		/** @type TI.Post[] */
		this.posts = [];
	}

	/**
	 * Ensure photos and information is loaded for all posts
	 * @param {TI.Provider.Photo.Base} db
	 * @param {Function} callback Method to call when all posts are fully loaded
	 */
	ensureLoaded(db, callback) {
		let pending = this.posts.length;

		for (let p of this.posts) {
			db.loadPost(p, post => { if (--pending <= 0) { callback(); } });
		}
	};

	/**
	 * Find child tag with name or slug
	 * @param {String} slug
	 * @returns TI.PostTag
	 */
	child(slug) {
		for (let t of this.tags) {
			if (t.title === slug || t.slug === slug) { return t; }
		}
		return null;
	};

	/**
	 * Whether this tag contains a child tag
	 * @param {String} name
	 * @returns Boolean
	 */
	hasChild(name) { return this.child(name) !== null; }

	/**
	 * @param {String} title
	 * @returns String
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