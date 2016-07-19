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
		/** @type TI.PostTag[] */
		this.tags = [];
		/** @type TI.Post[] */
		this.posts = [];
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
}

module.exports = PostTag;