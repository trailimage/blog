'use strict';

var format = require('../format.js');
var setting = require('../settings.js');
var library = require('../models/library.js');
var log = require('../log.js');
var PostTag = require('../models/post-tag.js');

/** @type {String} */
exports.key = 'tag-menu';

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
		render('tag-menu', { library: library, layout: 'layouts/script' });
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
			let sayCount = format.sayNumber(count) + ' Adventure' + ((count > 1) ? 's' : '');
			let view = 'post-tag';
			let options = {
				posts: tag.posts,
				title: (title == undefined) ? (tag.title + ': ' + sayCount) : title,
				tagName: tag.title,
				tagCount: sayCount
			};
			res.sendView(info.slug, render => { render(view, options); });
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