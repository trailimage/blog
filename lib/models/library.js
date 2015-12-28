'use strict';

const TI = require('../');
const is = TI.is;

/**
 * Collection of photos grouped into "posts" (called a "set" or "album" in most providers)
 * that are in turn assigned "post tags"
 * @alias TI.Library
 */
class Library {
	constructor() {
		/**
		 * Root tags
		 * @type Object.<TI.PostTag>
		 */
		this.tags = {};

		/**
		 * Flat reference to all posts for simplified lookup
		 * @type TI.Post[]
		 */
		this.posts = [];

		/**
		 * All photo tags in hash[slug] = full name format
		 * @type {Object.<String, String>}
		 **/
		this.photoTags = {};

		/**
		 * Whether post information is loaded
		 * @returns {Boolean}
		 */
		this.postInfoLoaded = false;
	}

	/**
	 * Singleton
	 * @returns {TI.Library}
	 */
	static get current() { return instance; }

	/**
	 * @param {function(TI.Library)} callback
	 */
	static load(callback) {
		if (instance !== null) {
			callback(instance);
		} else {
			TI.active.photo.loadLibrary(library => {
				instance = library;
				callback(library);
			});
		}
	};

	/**
	 * Empty library object before reloading from source
	 */
	empty() {
		this.postInfoLoaded = false;
		this.posts = [];
		this.tags = {};
		this.photoTags = {};
	}

	/**
	 * Array of all post slugs
	 * @returns {String[]}
	 */
	postSlugs() { return this.posts.map(p => p.slug); };

	/**
	 * Array of all tag slugs
	 * @param {String[]} [names] List of tag names or all if no list given
	 * @returns {String[]}
	 */
	tagSlugs(names) {
		/** @type String[] */
		let slugs = [];

		if (is.array(names) && names.length > 0) {
			// get slugs for named tags
			for (let childName of names) {
				for (let key in this.tags) {
					let parentTag = this.tags[key];
					let childTag = parentTag.child(childName);
					if (is.value(childTag)) { slugs.push(parentTag.slug + '/' + childTag.slug); }
				}
			}
		} else {
			// get slugs for all tags
			for (let key in this.tags) {
				let parentTag = this.tags[key];
				for (let childTag of parentTag.tags) {
					slugs.push(parentTag.slug + '/' + childTag.slug);
				}
			}
		}
		return slugs;
	};

	/**
	 * Find tag having child tag with given name
	 * @param {String} name
	 * @returns {TI.PostTag}
	 */
	tagWithChild(name) {
		for (let key in this.tags) {
			let tag = this.tags[key];
			if (is.defined(tag,'hasChild') && tag.hasChild(name)) { return tag; }
		}
		return null;
	};

	/**
	 * Find post with given ID
	 * @namespace TI.Library.postWithID
	 * @param {String} id Post ID
	 * @returns {TI.Post}
	 */
	postWithID(id) {
		for (let p of this.posts) { if (p.id === id) { return p; } }
		return null;
	};

	/**
	 * Find post with given slug
	 * @param {String} slug
	 * @param {String} [partSlug = null]
	 * @returns {TI.Post}
	 */
	postWithSlug(slug, partSlug) {
		if (is.value(partSlug)) { slug += "/" + partSlug; }
		for (let p of this.posts) { if (p.isMatch(slug)) { return p; } }
		return null;
	};

	/**
	 * Unload particular posts to force refresh from source
	 * @param {String[]} slugs
	 */
	unload(slugs) {
		for (let s of slugs) {
			let p = this.postWithSlug(s);
			// removing post details will force it to reload on next access
			if (p !== null) { p.removeDetails(); }
		}
	};

	/**
	 * Get unique list of tags used on photos in the post and update photo tags to use full names
	 * @param {TI.Photo[]} photos
	 * @returns {String}
	 */
	photoTagList(photos) {
		/**
		 * All photo tags in the post
		 * @type String[]
		 **/
		let postPhotoTags = [];

		for (let p of photos) {
			/**
			 * Tag slugs to remove from photo
			 * @type String[]
			 */
			let toRemove = [];

			for (let i = 0; i < p.tags.length; i++) {
				let tagSlug = p.tags[i];
				/**
				 * Lookup full tag name from its slug
				 * @type String
				 */
				let tagName = this.photoTags[tagSlug];

				if (is.value(tagName)) {
					// replace tag slug in photo with tag name
					p.tags[i] = tagName;
					if (postPhotoTags.indexOf(tagName) == -1) { postPhotoTags.push(tagName); }
				} else {
					// remove tag slug from list
					// this can happen if a photo has tags intentionally excluded from the library
					toRemove.push(tagSlug);
				}
			}

			for (let tagSlug of toRemove) {
				let index = p.tags.indexOf(tagSlug);
				if (index >= 0) { p.tags.splice(index, 1); }
			}
		}

		return (postPhotoTags.length > 0) ? postPhotoTags.join(', ') : null;
	}

	/**
	 * Add post to library
	 * @namespace TI.Library.addPost
	 * @param {TI.Post} p
	 */
	addPost(p) {
		// exit if post with same ID is already present
		if (this.posts.filter(e => e.id === p.id).length > 0) { return; }

		this.posts.push(p);

		if (p.chronological && this.posts.length > 1) {
			/** @type TI.Post */
			let next = this.posts[this.posts.length - 2];

			if (next.chronological) {
				p.next = next;
				next.previous = p;
			}
		}
	}

// - Private members ----------------------------------------------------------

	/**
	 * Match posts that are part of a series
	 */
	correlatePosts() {
		/** @type TI.Post */
		let p = this.posts[0];
		/** @type TI.Post[] */
		let parts = [];

		while (p != null && p.previous != null) {
			if (p.subTitle !== null) {
				parts.push(p);

				while (p.previous != null && p.previous.title == p.title) {
					p = p.previous;
					parts.unshift(p);
				}

				if (parts.length > 1) {
					parts[0].makeSeriesStart();

					for (let i = 0; i < parts.length; i++) {
						parts[i].part = i + 1;
						parts[i].totalParts = parts.length;
						parts[i].isPartial = true;

						if (i > 0) { parts[i].previousIsPart = true; }
						if (i < parts.length - 1) { parts[i].nextIsPart = true; }
					}
				} else {
					p.ungroup();
				}
				parts = [];
			}
			p = p.previous;
		}
	}
}

module.exports = Library;

// - Private static members

/**
 * Singleton
 * @type TI.Library
 **/
let instance = null;