'use strict';

/**
 * Post tags (categories)
 */

const is = require('../is.js');
const format = require('../format.js');
const template = require('../template.js');
const setting = require('../settings.js');
const library = require('../models/library.js').current;
const log = require('../log.js');
const PostTag = require('../models/post-tag.js');

/** @type {String} */
exports.key = 'menu:tag';

exports.view = (req, res) => {
	showTag(res, new TagInfo(req.params.category, req.params.tag));
};

/**
 * "Home" page shows latest "When" tag that contains posts
 * @param req
 * @param res
 */
exports.home = (req, res) => {
	let year = (new Date()).getFullYear();
	let when = library.tags['When'];
	let tag = null;
	let count = 0;

	while (count == 0) {
		tag = when.child(year.toString());
		if (tag !== null) { count = tag.posts.length; }
		year--;
	}
	showTag(res, new TagInfo('when', tag), setting.title);
};

exports.menu = (req, res) => {
	res.sendView(exports.key, render => {
		render(template.page.tagMenu, { library: library, layout: template.layout.none });
	});
};

//- Private members -----------------------------------------------------------

/**
 * @param res Response
 * @param {TagInfo} info
 * @param {String} [title]
 */
function showTag(res, info, title) {
	let tag = info.tag;

	if (tag !== null) {
		tag.loadPhotos(() => {
			let count = tag.posts.length;
			let options = {
				posts: tag.posts,
				title: tag.title,
				// a little lame but header is in layout so custom CSS must be sent as property
				headerCSS: 'post-tag-header',
				subtitle: format.sayNumber(count) + ' Adventure' + ((count > 1) ? 's' : '')
			};
			res.sendView(info.slug, render => { render(template.page.postTag, options); });
		});
	} else {
		res.notFound();
	}
}

class TagInfo {
	/**
	 * @param {string} c Category (Who, What, When, Where)
	 * @param {string|PostTag} [t] PostTag
	 * @constructor
	 */
	constructor(c, t) {
		/** @type {PostTag} */
		this.tag = null;
		this.slug = null;

		/** @type {PostTag} */
		let parent = null;

		if (t instanceof PostTag) {
			// use given tag object
			this.tag = t;
			this.slug = c + '/' + t.slug;
		} else if (c != 'tag') {
			// get named parent and child
			this.slug = c + '/' + t;
			parent = library.tags[format.capitalize(c)];
			this.tag = (parent != null) ? parent.child(t) : null;
		} else {
			// search for parent having named child
			parent = library.tagWithChild(t);

			if (parent !== null) {
				this.tag = parent.child(t);
				this.slug = parent.slug + '/' + t;
			}
		}
	}
}