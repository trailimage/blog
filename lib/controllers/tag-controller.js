'use strict';

/**
 * Post tags (categories)
 */
const TI = require('../');
const format = TI.format;
const template = TI.template;
const library = TI.Library.current;
const PostTag = TI.PostTag;
const jsonLD = TI.LinkData.Factory;

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
		// step backwards until a year with posts is found
		tag = when.child(year.toString());
		if (tag !== null) { count = tag.posts.length; }
		year--;
	}
	showTag(res, new TagInfo('when', tag), true);
};

exports.menu = (req, res) => {
	const t = template.page.tagMenu;
	res.sendView(t, render => { render(t, { library: library, layout: template.layout.none }); });
};

//- Private members -----------------------------------------------------------

/**
 * @param res Response
 * @param {TagInfo} info
 * @param {Boolean} [homePage = false]
 */
function showTag(res, info, homePage) {
	let tag = info.tag;

	if (tag !== null) {
		// ensure all post information and photos are loaded before rendering view
		tag.ensureLoaded(TI.active.photo, ()=> {
			let ld = jsonLD.fromPostTag(tag, info.slug, homePage);
			let count = tag.posts.length;
			let options = {
				posts: tag.posts,
				title: tag.title,
				jsonLD: ld.serialize(),
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
	 * @param {String} c Category (Who, What, When, Where)
	 * @param {String|PostTag} [t] PostTag
	 * @constructor
	 */
	constructor(c, t) {
		/** @type PostTag */
		this.tag = null;
		this.slug = null;

		/** @type PostTag */
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