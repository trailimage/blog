'use strict';

/**
 * Post tags (categories)
 */
const TI = require('../');
const is = TI.is;
const config = TI.config;
const format = TI.format;
const template = TI.template;
const library = TI.Library.current;
const PostTag = TI.PostTag;
const jsonLD = TI.LinkData.Factory;

/**
 * A particular post tag, like When/2013
 */
exports.view = (req, res) => {
	showPostTag(res, req.params['rootTag'], req.params['tag']);
};

/**
 * "Home" page shows latest default tag that contains posts
 * This is still messed up from a configurability perspective since it assumes
 * the default tag has years as child tags
 * @param req
 * @param res
 */
exports.home = (req, res) => {
	let year = (new Date()).getFullYear();
	let defaultTag = library.tags[config.library.defaultPostTag];
	let tag = null;
	let count = 0;

	while (count == 0) {
		// step backwards until a year with posts is found
		tag = defaultTag.child(year.toString());
		if (tag !== null) { count = tag.posts.length; }
		year--;
	}
	showPostTag(res, defaultTag, year.toString(),  true);
};

/**
 * Show root tag with list of child tags
 * @alias TI.Controller.tag.root
 * @param req
 * @param res
 */
exports.root = (req, res) => {
	let slug = req.params['rootTag'];

	if (is.value(slug)) {
		res.sendView(slug, render => {
			// use renderer to build view that wasn't cached
			let tag = library.tagWithSlug(slug);

			if (is.value(tag)) {
				let ld = jsonLD.fromPostTag(tag, tag.slug);
				let count = tag.tags.length;
				let options = { tags: tag.tags };

				renderView(render, template.page.postTagCategory, tag, ld, options, count, 'Post Tag');
			} else {
				res.notFound();
			}
		});
	} else {
		res.notFound();
	}
};

exports.menu = (req, res) => {
	const t = template.page.tagMenu;
	res.sendView(t, render => { render(t, { library: library, layout: template.layout.none }); });
};

//- Private members -----------------------------------------------------------

/**
 * @param res Response
 * @param {String} rootTag
 * @param {String} tag
 * @param {Boolean} [homePage = false]
 */
function showPostTag(res, rootTag, tag, homePage) {
	let slug = rootTag + '/' + tag;

	res.sendView(slug, render => {
		// use renderer to build view that wasn't cached
		let tag = library.tagWithSlug(slug);

		if (is.value(tag)) {
			tag.ensureLoaded(TI.active.photo, ()=> {
				let ld = jsonLD.fromPostTag(tag, slug, homePage);
				let count = tag.posts.length;
				let options = { posts: tag.posts };
				renderView(render, template.page.postTag, tag, ld, options, count, config.site.postAlias);
			});
		} else {
			res.notFound();
		}
	});
}

/**
 * Render post tag if it wasn't cached
 * @param {function} render
 * @param {String} template Name of template
 * @param {TI.PostTag} tag
 * @param {TI.LinkData.Thing} linkData
 * @param {Object} options
 * @param {Number} childCount
 * @param {String} childName
 */
function renderView(render, template, tag, linkData, options, childCount, childName) {
	options.title = tag.title;
	options.jsonLD = linkData.serialize();
	options.headerCSS = config.style.css.postTagHeader;
	options.subtitle = format.sayNumber(childCount) + ' ' + childName + ((childCount > 1) ? 's' : '');

	render(template, options);
}