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
		/**
		 * Slug with parent slug prefix
		 * @type String
		 */
		this.fullSlug = null;
		/** @type TI.PostTag[] */
		this.tags = [];
		/** @type TI.Post[] */
		this.posts = [];
	}

	/**
	 * Update child tag slug and add to collection
	 * @param {TI.PostTag} t
	 */
	addChild(t) {
		if (t !== null) {
			t.fullSlug = this.slug + '/' + t.slug;
			this.tags.push(t);
		}
	}

	/**
	 * Ensure photos and information are loaded for all posts
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
	 * @returns {TI.PostTag}
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
	 * @returns {Boolean}
	 */
	hasChild(name) { return this.child(name) !== null; }
}

module.exports = PostTag;