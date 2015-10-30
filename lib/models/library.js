'use strict';

const format = require('./../format.js');
const is = require('./../is.js');
const Enum = require('./../enum.js');
const setting = require('./../settings.js');
const Post = require('./post.js');
const PostTag = require('./post-tag.js');
const db = require('./../db.js');

/**
 * Singleton
 * @type {Library}
 **/
let instance = null;

/**
 * Singleton
 */
class Library {
	constructor() {
		/**
		 * Root tags
		 * @type {Object.<PostTag>}
		 */
		this.tags = {};

		/**
		 * Flat reference to all posts for simplified lookup
		 * @type {Post[]}
		 */
		this.posts = [];

		/**
		 * All photo tags in hash[key] = name format
		 * @type {Object.<String>}
		 **/
		this.photoTags = {};

		/**
		 * Whether post information is loaded
		 * @returns {boolean}
		 */
		this.postInfoLoaded = false;
	}

	/**
	 * @returns {Library}
	 */
	static get current() { return instance; }

	/**
	 * @param {function(Library)} callback
	 */
	static load(callback) {
		if (instance !== null) {
			callback(instance);
		} else {
			db.load(library => {
				instance = library;
				callback(library);
			});
		}
	};

	/**
	 * @param {Flickr.Tree|Object} flickrTree
	 * @return {Library}
	 */
	static parse(flickrTree) {
		let library = new Library();
		for (let c of flickrTree.collection) { library._addFlickrCollection(c, true); }
		library._correlatePosts();
		return library;
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
		/** @type {String[]} */
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
	 * @return {PostTag}
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
	 * @param {String} id Post ID
	 * @returns {Post}
	 */
	postWithID(id) {
		for (let p of this.posts) { if (p.id === id) { return p; } }
		return null;
	};

	/**
	 * Find post with given slug
	 * @param {String} slug
	 * @param {String} [partSlug = null]
	 * @returns {Post}
	 */
	postWithSlug(slug, partSlug) {
		if (is.value(partSlug)) { slug += "/" + partSlug; }
		for (let p of this.posts) { if (p.isMatch(slug)) { return p; } }
		return null;
	};

	/**
	 * Reload library from Flickr
	 * @param {function(string[])} [callback] List of slugs that need to be refreshed
	 */
	reload(callback) {
		// track tag slugs that need to be refreshed if cached
		let tagSlugs = [];
		// record post slugs so they can be compared to the new list
		let postSlugs = this.posts.map(p => p.slug);

		this.postInfoLoaded = false;
		this.posts = [];
		this.tags = {};
		this.photoTags = {};

		//loadFromFlickr(() => {
		//	// posts collection may now contain new items
		//	this.posts.filter(p => postSlugs.indexOf(p.slug) == -1).forEach(p => {
		//		log.info('Found new post "%s"', p.title);
		//		// all tags applied to the new post — will need to be refreshed
		//		tagSlugs = tagSlugs.concat(exports.tagSlugs(p.tags));
		//		if (p.next !== null) { tagSlugs.push(p.next.slug); }
		//		if (p.previous !== null) { tagSlugs.push(p.previous.slug); }
		//	});
		//	// load all the photo tags
		//	PhotoTag.load(() => { callback(tagSlugs); });
		//});
	};

	/**
	 * Unload particular posts
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
	 * Get unique list of tags used on photos in the post
	 * @param {Photo[]} photos
	 * @return {String}
	 */
	photoTagList(photos) {
		/**
		 * All photo tags in the post
		 * @type {String[]}
		 **/
		let postPhotoTags = [];

		for (let p of photos) {
			for (let i = 0; i < p.tags.length; i++) {
				/**
				 * Lookup full tag name from its slug
				 * @type {String}
				 */
				let tagName = this.photoTags[p.tags[i]];

				if (is.value(tagName)) {
					// replace tag slug in photo with tag name
					p.tags[i] = tagName;
					if (postPhotoTags.indexOf(tagName) == -1) { postPhotoTags.push(tagName); }
				}
			}
		}
		return (postPhotoTags.length > 0) ? postPhotoTags.join(', ') : null;
	}

	/**
	 * Add Flickr collection to the tree
	 * @param {Flickr.Collection} collection
	 * @param {Boolean} [root = false]
	 * @return {PostTag}
	 * @private
	 */
	_addFlickrCollection(collection, root) {
		let t = PostTag.parse(collection);
		/** @type {Post} */
		let p = null;

		if (root === undefined) { root = false; }
		if (root) { this.tags[t.title] = t; }

		if (is.array(collection.set) && collection.set.length > 0) {
			// tag contains one or more posts
			for (let s of collection.set) {
				// see if post is already present in the library
				p = this.postWithID(s.id);

				// create item object if it isn't part of an already added group
				if (p === null) { p = Post.parse(s); }

				p.addTag(t.title);
				t.posts.push(p);        // add post to tag
				this._addPost(p);             // add post to library
			}
		}

		if (collection.collection) {
			// recursively add child tags
			collection.collection.forEach(c => { t.tags.push(this._addFlickrCollection(c)) });
		}

		if (root) {
			// manually create poetry set
			let poemPost = {
				id: setting.flickr.photoSet.poetry,
				title: 'Ruminations'
			};
			this._addPost(Post.parse(poemPost, false));
		}
		return t;
	}

	/**
	 * Add post to library
	 * @param {Post} p
	 * @private
	 */
	_addPost(p) {
		// exit if post with same ID is already present
		if (this.posts.filter(e => e.id === p.id).length > 0) { return; }

		this.posts.push(p);

		if (p.chronological && this.posts.length > 1) {
			/** @type {Post} */
			let next = this.posts[this.posts.length - 2];

			if (next.chronological) {
				p.next = next;
				next.previous = p;
			}
		}
	}

	/**
	 * Match posts that are part of a series
	 */
	_correlatePosts() {
		/** @type {Post} */
		let p = this.posts[0];
		/** @type {Post[]} */
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

// force singleton
module.exports = Library;