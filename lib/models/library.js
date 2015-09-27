'use strict';

var format = require('./../format.js');
var is = require('./../is.js');
var Enum = require('./../enum.js');
var setting = require('./../settings.js');
var Post = require('./post.js');
/** @type {PostTag} */
var PostTag = require('./post-tag.js');
var PhotoTag = require('./photo-tag.js');
var log = require('./../log.js');
/** @type {Object} */
var queue = {};

const key = 'model:library';

/**
 * Root tags
 * @type {Object.<PostTag>}
 */
exports.tags = {};

/**
 * Flat reference to all posts for simplified lookup
 * @type {Post[]}
 */
exports.posts = [];

/**
 * Hash of photo tags in hash[key] = name format
 * @type {Object.<String>}
 **/
exports.photoTags = {};

/**
 * Whether post information is loaded
 * @returns {boolean}
 */
exports.postInfoLoaded = false;

/**
 * Array of all post slugs
 * @returns {String[]}
 */
exports.postSlugs = function() { return exports.posts.map(p => p.slug); };

/**
 * Array of all tag slugs
 * @param {String[]} [names] List of tag names or all if no list given
 * @returns {String[]}
 */
exports.tagSlugs = names => {
	/** @type {String[]} */
	let slugs = [];

	if (is.array(names) && names.length > 0) {
		// get slugs for named tags
		for (let childName of names) {
			for (let key in exports.tags) {
				let parentTag = exports.tags[key];
				let childTag = parentTag.child(childName);
				if (is.value(childTag)) { slugs.push(parentTag.slug + '/' + childTag.slug); }
			}
		}
	} else {
		// get slugs for all tags
		for (let key in exports.tags) {
			let parentTag = exports.tags[key];
			for (let childTag of parentTag.tags.length) {
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
exports.tagWithChild = name => {
	for (let key in exports.tags) {
		let tag = exports.tags[key];
		if (is.defined(tag,'hasChild') && tag.hasChild(name)) { return tag; }
	}
	return null;
};

/**
 * Find post with given ID
 * @param {String} id Set ID
 * @returns {Post}
 */
exports.postWithID = id => {
	for (let p of exports.posts) { if (p.id === id) { return p; } }
	return null;
};

/**
 * Find post with given slug
 * @param {String} slug
 * @param {String} [partSlug = null]
 * @returns {Post}
 */
exports.postWithSlug = (slug, partSlug) => {
	if (is.value(partSlug)) { slug += "/" + partSlug; }
	for (let p of exports.posts) { if (p.isMatch(slug)) { return p; } }
	return null;
};

// - Private methods ----------------------------------------------------------

/**
 * Add Flickr collection to the tree
 * @param {Flickr.Collection} api
 * @param {Boolean} [root = false]
 * @return {PostTag}
 */
function addTag(api, root) {
	let t = new PostTag(api);
	/** @type {Post} */
	let	p = null;

	if (root === undefined) { root = false; }
	if (root) { exports.tags[t.title] = t; }

	if (is.array(api.set) && api.set.length > 0) {
		// tag contains one or more posts
		for (let s of api.set) {
			// see if post is already present in the library
			p = exports.postWithID(s.id);

			// create item object if it isn't part of an already added group
			if (p === null) { p = Post.fromFlickr(s); }

			p.addTag(t.title);
			t.posts.push(p);        // add post to tag
			addPost(p);             // add post to library
		}
	}

	if (api.collection) {
		// recursively add child tags
		api.collection.forEach(c => { t.tags.push(addTag(c)) });
	}

	if (root) {
		addPost(Post.fromFlickr({'id': setting.flickr.poemSet, 'title': 'Ruminations'}, false));
	}
	return t;
}

/**
 * Add post to library
 * @param {Post} p
 */
function addPost(p) {
	if (exports.posts.filter(e => e.id === p.id).length > 0) { return; }

	exports.posts.push(p);

	if (p.chronological && exports.posts.length > 1) {
		/** @type {Post} */
		let next = exports.posts[exports.posts.length - 2];

		if (next.chronological) {
			p.next = next;
			next.previous = p;
		}
	}
}

// - Initialization -----------------------------------------------------------

/**
 * @param {function} callback
 */
exports.load = callback => {
	if (setting.cacheOutput) {
		// check Redis when caching is enabled
		let db = require('../adapters/hash.js');

		db.getAll(key, cache => {
			if (cache !== null) {
				// the library is already cached
				try	{
					parseTree(JSON.parse(cache.tree));

					for (let p of exports.posts) {
						/** @type {String} */
						let value = cache[p.id];

						if (is.empty(value) || value === 'undefined') {
							// cached API data has an invalid post entry
							log.error('Encountered invalid cached content for post %s: must reload', p.id);
							exports.reload(callback);
							return;
						} else {
							// parse additional post data
							p.addInfo(JSON.parse(value));
						}
					}
				} catch (error) {
					log.error('Unable to parse cached library (%s): must reload', error.toString());
					exports.reload(callback);
					return;
				}
				// when pulled from cache the asynchronous post details are already present
				exports.postInfoLoaded = true;

				log.info('Loaded %d photo posts from cache with details', exports.posts.length);
				PhotoTag.load(callback);
			} else {
				// load from Flickr when the library isn't cached
				loadFromFlickr(() => { PhotoTag.load(callback); });
			}
		});
	} else {
		// load from Flickr when caching is disabled
		loadFromFlickr(() => { PhotoTag.load(callback); });
	}
};

/**
 * Reload library from Flickr
 * @param {function(string[])} [callback] List of slugs that need to be refreshed
 */
exports.reload = callback => {
	// track tag slugs that need to be refreshed if cached
	let tagSlugs = [];
	// record post slugs so they can be compared to the new list
	let postSlugs = exports.posts.map(p => p.slug);

	exports.postInfoLoaded = false;
	exports.posts = [];
	exports.tags = {};
	exports.photoTags = {};

	loadFromFlickr(() => {
		// posts collection may now contain new items
		exports.posts.filter(p => postSlugs.indexOf(p.slug) == -1).forEach(p => {
			log.info('Found new post "%s"', p.title);
			// all tags applied to the new post — will need to be refreshed
			tagSlugs = tagSlugs.concat(exports.tagSlugs(p.tags));
			if (p.next !== null) { tagSlugs.push(p.next.slug); }
			if (p.previous !== null) { tagSlugs.push(p.previous.slug); }
		});
		// load all the photo tags
		PhotoTag.load(() => { callback(tagSlugs); });
	});
};

/**
 * Unload particular posts
 * @param {String[]} slugs
 */
exports.unload = slugs => {
	for (let s of slugs) {
		let p = exports.postWithSlug(s);
		// removing post details will force it to reload on next access
		if (p !== null) { p.removeDetails(); }
	}
};

/**
 * @param {function} [callback]
 */
function loadFromFlickr(callback) {
	var flickr = require('../adapters/flickr.js');

	flickr.getCollection(tree => {
		if (tree === null) {
			log.warn('Retrying in %d seconds', (setting.retryDelay / Enum.time.second));
			setTimeout(function() { loadFromFlickr(callback); }, setting.retryDelay);
		} else {
			parseTree(tree);
			// queue all the Flickr responses for eventual caching
			queue['tree'] = JSON.stringify(tree);
			log.info('Loaded %d photo posts from Flickr: beginning detail retrieval', exports.posts.length);
			if (is.callable(callback)) { callback(); }
			loadPostInfo();
		}
	});
}

/**
 * Load Flickr response into library instance
 * @param {Flickr.Tree} api
 */
function parseTree(api) {
	for (let c of api.collection) { addTag(c, true); }
	correlatePosts();
}

/**
 * Asynchronously load additional post information
 */
function loadPostInfo() {
	var flickr = require('../adapters/flickr.js');
	// track number of posts awaiting info
	var pending = exports.posts.length;

	for (let p of exports.posts) {
		// begin an async info call for each post
		/** @param {Post} post */
		(post => {
			flickr.getSetInfo(post.id, info => {
				//log.info('Loaded set detail %d/%d "%s"', index + 1, total, set.name());
				if (info) {
					queue[post.id] = JSON.stringify(info);
					post.addInfo(info);
				} else {
					// if no post info was found then assume post doesn't belong in library
					log.warn('Removing post %s from library', post.id);
					delete queue[post.id];
				}
				if (--pending <= 0) {
					// all posts have loaded info
					let db = require('../adapters/hash.js');
					exports.postInfoLoaded = true;
					db.addAll(key, queue);
					log.info('Finished loading photo set details');
				}
			});
		})(p);
	}
}

/**
* Match posts that are part of a series
*/
function correlatePosts() {
	/** @type {Post} */
	let p = exports.posts[0];
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